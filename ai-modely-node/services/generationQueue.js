/**
 * Fronta úkolů na generování českých textů (popisky a přehledy).
 *
 * Požadavky od klientů úkoly jen zařadí a hned odpoví - samotné volání AI
 * probíhá na pozadí s omezeným počtem souběžných úkolů,
 * takže nedochází ke stovkám paralelních volání poskytovatelů.
 *
 * Fronta je uložená v databázi (kolekce generationjobs), takže přežije restart
 * a funguje i při více instancích serveru, index zabraňuje duplicitnímu zařazení.
 */

const { SUMMARY_ENABLED } = require("../config/env");
const AIModel = require("../models/AIModel");
const GenerationJob = require("../models/GenerationJob");
const { DESCRIPTION_VERSION, generateDescription, generateDescriptions } = require("./descriptionService");
const { generateInsights } = require("./insightsService");

// Kolik úkolů se zpracovává souběžně (víc paralelních volání AI nedává smysl,
// poskytovatelé mají omezené kvóty).
const configuredConcurrency = Number(process.env.GENERATION_CONCURRENCY);
const MAX_CONCURRENT_JOBS = Number.isInteger(configuredConcurrency) && configuredConcurrency > 0
    ? configuredConcurrency
    : 4;

// Jak často zpracovatel hledá nové úkoly
const POLL_INTERVAL_MS = 1000;

// Kolik popisků se vygeneruje v jednom volání AI na pozadí - méně požadavků
// na poskytovatele (menší riziko limitů) a celá dávka je hotová najednou
const DESCRIPTION_BATCH_SIZE = 6;

// Malá dávka pro právě prohlížené modely - první popisky se ukážou co nejdřív
const DESCRIPTION_HOT_BATCH_SIZE = 2;

// Jak čerstvý požadavek se považuje za právě prohlížený - klient ho při čekání
// opakovaně poptává, takže se mu priorita obnovuje; starší požadavky se už jen
// dogenerovávají na pozadí po velkých dávkách
const HOT_JOB_MAX_AGE_MS = 3 * 60 * 1000;

// Kolikrát se úkol zkusí znovu, než se označí jako nezdařený
const MAX_JOB_ATTEMPTS = 3;

// Čas před dalším pokusem - s počtem neúspěšných pokusů roste (1 min, 2 min, …)
const RETRY_DELAY_MS = 60000;

// Úkol ve stavu processing starší než tohle se považuje za uvízlý po pádu procesu
// a vrátí se mezi čekající
const STALE_PROCESSING_MS = 30 * 60 * 1000;

// Když poskytovatelé ohlásí vyčerpaný denní limit, fronta se na tuto dobu pozastaví,
// aby se nepromrhaly pokusy všech čekajících úkolů
const QUOTA_COOLDOWN_MS = 30 * 60 * 1000;

// Chyba, po které nemá smysl úkol opakovat (např. model není v databázi)
function permanentError(message) {
    const error = new Error(message);
    error.permanent = true;

    return error;
}

/** Pozná, že poskytovatelé hlásí vyčerpaný denní limit. */
function isQuotaFailure(error) {
    return /vyčerpaný limit|quota|resource_exhausted/i.test(error?.message ?? "");
}


/**
 * Zařadí požadavky do fronty. Stejný model se stejným typem se nezařadí dvakrát (unikátní index).
 * Požadavek, který dříve selhal, se zkusí znovu.
 */
async function enqueueJobs(type, modelIds) {
    if (!SUMMARY_ENABLED) {
        return 0;
    }

    const ids = [...new Set((modelIds ?? []).filter((id) => typeof id === "string" && id.trim().length > 0))];

    if (ids.length === 0) {
        return 0;
    }

    // Čerstvě požadované úkoly dostanou nejvyšší prioritu, aby se popisky právě
    // zobrazených modelů vygenerovaly před staršími požadavky z dřívějšího prohlížení
    const priority = Date.now();

    // Čekajícím úkolům se priorita zvedne hned - při opakovaném dotazu klienta
    await GenerationJob.updateMany(
        { type, modelId: { $in: ids }, status: "pending" },
        { $set: { priority } }
    );

    try {
        const result = await GenerationJob.bulkWrite(
            ids.map((modelId) => ({
                updateOne: {
                    // Neúspěšný pokus se nastaví jako pending/processing 
                    filter: { type, modelId, status: "failed" },
                    update: {
                        $set: {
                            status: "pending",
                            attempts: 0,
                            runAt: new Date(),
                            processingStartedAt: null,
                            lastError: null,
                            priority,
                        },
                    },
                    upsert: true,
                },
            })),
            { ordered: false }
        );

        return (result.upsertedCount ?? 0) + (result.modifiedCount ?? 0);
    } catch (error) {
        // Souběžné požadavky zařazují stejné úkoly - duplicitní vložení se ignoruje
        const onlyDuplicates = error?.code === 11000
            || (error?.writeErrors?.length > 0 && error.writeErrors.every((item) => item.err?.code === 11000));

        if (!onlyDuplicates) {
            throw error;
        }

        return 0;
    }
}

/** Označí další požadavek ke zpracování - nejdřív podle priority, při shodě nejstarší. */
async function claimNextJob() {
    return GenerationJob.findOneAndUpdate(
        { status: "pending", runAt: { $lte: new Date() } },
        { $set: { status: "processing", processingStartedAt: new Date() } },
        { sort: { priority: -1, runAt: 1, createdAt: 1 }, new: true }
    );
}

/** Označí dávku čekajících požadavků jednoho typu (nejdřív podle priority, při shodě nejstarší). */
async function claimNextJobs(type, limit, minPriority = 0) {
    const jobs = [];

    while (jobs.length < limit) {
        const job = await GenerationJob.findOneAndUpdate(
            { type, status: "pending", runAt: { $lte: new Date() }, priority: { $gte: minPriority } },
            { $set: { status: "processing", processingStartedAt: new Date() } },
            { sort: { priority: -1, runAt: 1, createdAt: 1 }, new: true }
        );

        if (!job) {
            break;
        }

        jobs.push(job);
    }

    return jobs;
}

/** Vrátí do fronty požadavky, které nebyly vyřízeny (processing po pádu procesu). */
async function reclaimStaleJobs() {
    const result = await GenerationJob.updateMany(
        { status: "processing", processingStartedAt: { $lt: new Date(Date.now() - STALE_PROCESSING_MS) } },
        { $set: { status: "pending", runAt: new Date(), processingStartedAt: null } }
    );

    if (result.modifiedCount > 0) {
        console.log(`Fronta generování: ${result.modifiedCount} zaseknutých požadavků se vrátilo mezi čekající.`);
    }
}


/** Zpracuje požadavek na popisek: načte model z databáze, nechá text vygenerovat a uloží ho. */
async function processDescriptionJob(job) {
    const model = await AIModel.findOne({ modelId: job.modelId }).lean();

    if (!model) {
        throw permanentError("Model není v databázi, není z čeho generovat.");
    }

    // Mezi zařazením a zpracováním mohl popisek doplnit jiný požadavek
    if (model.description?.version === DESCRIPTION_VERSION && model.description?.text?.trim()) {
        return;
    }

    const { description } = await generateDescription(model);

    await AIModel.updateOne(
        { modelId: job.modelId },
        {
            $set: {
                description: {
                    text: description,
                    version: DESCRIPTION_VERSION,
                    status: "ok",
                    generatedAt: new Date(),
                },
            },
        }
    );
}

/**
 * Zpracuje dávku požadavků na popisky: načte modely z databáze, nechá texty
 * vygenerovat v jednom volání AI a každý výsledek uloží zvlášť.
 * Vrací, které požadavky jsou hotové a které selhaly (každý s vlastní chybou).
 */
async function processDescriptionBatch(jobs) {
    const models = await AIModel.find({ modelId: { $in: jobs.map((job) => job.modelId) } }).lean();
    const byId = new Map(models.map((model) => [model.modelId, model]));

    const doneJobIds = [];
    const failedJobs = [];
    const toGenerate = [];
    const generatingJobs = [];

    for (const job of jobs) {
        const model = byId.get(job.modelId);

        if (!model) {
            failedJobs.push({ job, error: permanentError("Model není v databázi, není z čeho generovat.") });
            continue;
        }

        // Mezi zařazením a zpracováním mohl popisek doplnit jiný požadavek
        if (model.description?.version === DESCRIPTION_VERSION && model.description?.text?.trim()) {
            doneJobIds.push(job._id);
            continue;
        }

        toGenerate.push(model);
        generatingJobs.push(job);
    }

    if (toGenerate.length > 0) {
        const generated = await generateDescriptions(toGenerate);
        const generatedById = new Map(generated.map((item) => [item.modelId, item.description]));

        for (const [modelId, description] of generatedById) {
            await AIModel.updateOne(
                { modelId },
                {
                    $set: {
                        description: {
                            text: description,
                            version: DESCRIPTION_VERSION,
                            status: "ok",
                            generatedAt: new Date(),
                        },
                    },
                }
            );
        }

        for (const job of generatingJobs) {
            if (generatedById.has(job.modelId)) {
                doneJobIds.push(job._id);
            } else {
                // AI pro model popisek nevrátilo nebo neprošel kontrolou délky - zkusí se znovu
                failedJobs.push({ job, error: new Error(`AI nevrátilo použitelný popisek pro model „${job.modelId}“.`) });
            }
        }
    }

    return { doneJobIds, failedJobs };
}

/** Zpracuje požadavek na přehledy. */
async function processInsightsJob(job) {
    await generateInsights(job.modelId);
}

const PROCESSORS = {
    description: processDescriptionJob,
    insights: processInsightsJob,
};

// Kolik požadavků se právě zpracovává a jestli fronta stojí kvůli vyčerpanému limitu
let runningJobs = 0;
let quotaCooldownUntil = 0;

// Krátká pauza při přechodném omezení rychlosti (429) - jiné než denní vyčerpání kvóty
let rateCooldownUntil = 0;

/** Označí požadavek po neúspěchu - buď se odloží další pokus, nebo požadavek ukončí. */
async function failJob(job, error) {
    // Přechodné omezení rychlosti (429) - počká se jen doporučenou dobu od poskytovatele,
    // pokus se nepočítá a fronta se pozastaví na pár sekund místo desítek minut
    if (error.retryAfterMs) {
        rateCooldownUntil = Math.max(rateCooldownUntil, Date.now() + error.retryAfterMs);

        console.error(
            `Poskytovatelé dočasně omezují rychlost, fronta generování se pozastavuje ` +
            `na ${Math.max(1, Math.round(error.retryAfterMs / 1000))} sekund.`
        );

        await GenerationJob.updateOne(
            { _id: job._id },
            {
                $set: {
                    status: "pending",
                    runAt: new Date(Date.now() + error.retryAfterMs),
                    processingStartedAt: null,
                    lastError: error.message.slice(0, 500),
                },
            }
        );

        return;
    }

    // Vyčerpaný denní limit u všech poskytovatelů není chyba úkolu - úkol počká na konec pauzy a nepálí pokusy
    if (error.quotaExhausted || isQuotaFailure(error)) {
        quotaCooldownUntil = Date.now() + QUOTA_COOLDOWN_MS;

        console.error(
            `Poskytovatelé hlásí vyčerpaný limit, fronta generování se pozastavuje ` +
            `na ${Math.round(QUOTA_COOLDOWN_MS / 60000)} minut.`
        );

        await GenerationJob.updateOne(
            { _id: job._id },
            {
                $set: {
                    status: "pending",
                    runAt: new Date(quotaCooldownUntil),
                    processingStartedAt: null,
                    lastError: error.message.slice(0, 500),
                },
            }
        );

        return;
    }

    const attempts = job.attempts + 1;
    const exhausted = error.permanent || attempts >= MAX_JOB_ATTEMPTS;

    await GenerationJob.updateOne(
        { _id: job._id },
        {
            $set: {
                status: exhausted ? "failed" : "pending",
                attempts,
                // Další pokus se s počtem nezdarů odkládá (1 min, 2 min, …)
                runAt: new Date(Date.now() + attempts * RETRY_DELAY_MS),
                processingStartedAt: null,
                lastError: error.message.slice(0, 500),
            },
        }
    );

    if (exhausted) {
        console.error(`Požadavek „${job.type}“ pro model „${job.modelId}“ se nepodařil: ${error.message}`);
    }
}

/** Zpracuje jeden požadavek - po úspěchu se smaže, po chybě se odloží nebo označí jako nezdařený. */
async function runJob(job) {
    try {
        await PROCESSORS[job.type](job);
        await GenerationJob.deleteOne({ _id: job._id });
    } catch (error) {
        await failJob(job, error);
    } finally {
        runningJobs--;
    }
}

/** Zpracuje dávku požadavků na popisky - hotové se smažou, nezdařené se odloží jednotlivě. */
async function runDescriptionBatch(jobs) {
    try {
        const { doneJobIds, failedJobs } = await processDescriptionBatch(jobs);

        if (doneJobIds.length > 0) {
            await GenerationJob.deleteMany({ _id: { $in: doneJobIds } });
        }

        for (const { job, error } of failedJobs) {
            await failJob(job, error);
        }
    } catch (error) {
        // Chyba celé dávky (síť, limit, nečitelná odpověď) - požadavky se odloží a zkusí znovu
        for (const job of jobs) {
            await failJob(job, error);
        }
    } finally {
        runningJobs--;
    }
}

let lastReclaimAt = 0;

/** Jeden krok zpracovatele: uklidí zaseknuté požadavky a obsadí volná místa novými. */
async function tick() {
    if (!SUMMARY_ENABLED || Date.now() < quotaCooldownUntil || Date.now() < rateCooldownUntil) {
        return;
    }

    if (Date.now() - lastReclaimAt > STALE_PROCESSING_MS / 3) {
        lastReclaimAt = Date.now();
        await reclaimStaleJobs();
    }

    while (runningJobs < MAX_CONCURRENT_JOBS) {
        // Popisky se zpracovávají po dávkách v jednom volání AI - jedno volné místo
        // tak obslouží několik modelů najednou. Právě prohlížené modely (čerstvá
        // priorita) jedou po malých dávkách, aby se první popisky ukázaly co nejdřív;
        // starší požadavky z pozadí po velkých dávkách, které šetří limity poskytovatelů
        let batch = await claimNextJobs("description", DESCRIPTION_HOT_BATCH_SIZE, Date.now() - HOT_JOB_MAX_AGE_MS);

        if (batch.length === 0) {
            batch = await claimNextJobs("description", DESCRIPTION_BATCH_SIZE);
        }

        if (batch.length > 1) {
            runningJobs++;
            void runDescriptionBatch(batch);
            continue;
        }

        const job = batch[0] ?? (await claimNextJob());

        if (!job) {
            break;
        }

        runningJobs++;
        void runJob(job);
    }
}

let workerTimer = null;

/**
 * Spustí zpracovatele fronty na pozadí. Bez nastaveného poskytovatele se nespustí.
 * Proces (např. skript) skončí, když dodělá svou práci.
 */
function startGenerationWorker() {
    if (!SUMMARY_ENABLED || workerTimer) {
        return;
    }

    workerTimer = setInterval(() => {
        tick().catch((error) => console.error("Zpracovatel fronty generování selhal:", error));
    }, POLL_INTERVAL_MS);

    workerTimer.unref();

    console.log(`Fronta generování běží (souběžně nejvýš ${MAX_CONCURRENT_JOBS} požadavků).`);

    void tick().catch((error) => console.error("Zpracovatel fronty generování selhal:", error));
}

module.exports = {
    enqueueJobs,
    startGenerationWorker,
};

