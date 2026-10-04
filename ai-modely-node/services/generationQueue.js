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
const { DESCRIPTION_VERSION, generateDescription } = require("./descriptionService");
const { generateInsights } = require("./insightsService");

// Kolik úkolů se zpracovává souběžně (víc paralelních volání AI nedává smysl,
// poskytovatelé mají omezené kvóty).
const configuredConcurrency = Number(process.env.GENERATION_CONCURRENCY);
const MAX_CONCURRENT_JOBS = Number.isInteger(configuredConcurrency) && configuredConcurrency > 0
    ? configuredConcurrency
    : 4;

// Jak často zpracovatel hledá nové úkoly
const POLL_INTERVAL_MS = 1000;

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

/** Označí požadavek po neúspěchu - buď se odloží další pokus, nebo požadavek ukončí. */
async function failJob(job, error) {
    // Vyčerpaný limit není chyba úkolu - úkol počká na konec pauzy a nepálí pokusy
    if (isQuotaFailure(error)) {
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

let lastReclaimAt = 0;

/** Jeden krok zpracovatele: uklidí zaseknuté požadavky a obsadí volná místa novými. */
async function tick() {
    if (!SUMMARY_ENABLED || Date.now() < quotaCooldownUntil) {
        return;
    }

    if (Date.now() - lastReclaimAt > STALE_PROCESSING_MS / 3) {
        lastReclaimAt = Date.now();
        await reclaimStaleJobs();
    }

    while (runningJobs < MAX_CONCURRENT_JOBS) {
        const job = await claimNextJob();

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

