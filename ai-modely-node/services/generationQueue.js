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

const { SUMMARY_ENABLED, CONTENT_BULK_DAILY_LIMIT } = require("../config/env");
const AIModel = require("../models/AIModel");
const GenerationJob = require("../models/GenerationJob");
const GenerationState = require("../models/GenerationState");
const { DESCRIPTION_VERSION, generateDescription, generateDescriptions } = require("./descriptionService");
const { generateInsights } = require("./insightsService");

// Kolik úkolů se zpracovává souběžně (víc paralelních volání AI nedává smysl,
// poskytovatelé mají omezené kvóty).
const configuredConcurrency = Number(process.env.GENERATION_CONCURRENCY);
const MAX_CONCURRENT_JOBS = Number.isInteger(configuredConcurrency) && configuredConcurrency > 0
    ? configuredConcurrency
    : 4;

// Kolik hromadných úloh doplnění se smí denně zpracovat - zbytek denní kvóty
// poskytovatelů zůstává vyhrazený pro požadavky uživatelů (0 = hromadné doplňování vypnuté)
const BULK_DAILY_LIMIT = CONTENT_BULK_DAILY_LIMIT;

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
async function enqueueJobs(type, modelIds, { bulk = false } = {}) {
    if (!SUMMARY_ENABLED) {
        return 0;
    }

    const ids = [...new Set((modelIds ?? []).filter((id) => typeof id === "string" && id.trim().length > 0))];

    if (ids.length === 0) {
        return 0;
    }

    // Živý požadavek uživatele dostane nejvyšší prioritu a předběhne hromadné doplňování.
    // Hromadné doplňování (bulk) má prioritu 0, takže ustoupí jakémukoli požadavku uživatele.
    const priority = bulk ? 0 : Date.now();

    // Prioritu čekajícím úkolům zvedá jen živý požadavek (uživatel se k modelu vrátil).
    // Hromadné doplňování čekající úkoly nemění, aby živý požadavek neponížilo.
    if (!bulk) {
        await GenerationJob.updateMany(
            { type, modelId: { $in: ids }, status: "pending" },
            { $set: { priority, isBulk: false } }
        );
    }

    try {
        const result = await GenerationJob.bulkWrite(
            ids.map((modelId) => ({
                updateOne: {
                    // Neúspěšný pokus se nastaví jako pending a zkusí se znovu
                    filter: { type, modelId, status: "failed" },
                    update: {
                        $set: {
                            status: "pending",
                            attempts: 0,
                            runAt: new Date(),
                            processingStartedAt: null,
                            lastError: null,
                            priority,
                            isBulk: bulk,
                        },
                    },
                    upsert: true,
                },
            })),
            { ordered: false }
        );

        return (result.upsertedCount ?? 0) + (result.modifiedCount ?? 0);
    } catch (error) {
        // Souběžné požadavky zařazují stejné úkoly - duplicitní vložení se ignoruje.
        // BulkWrite kvůli duplicitě vyhodí chybu, i když se část úkolů vložila,
        // proto se počty berou z částečného výsledku.
        const onlyDuplicates = error?.code === 11000
            || (error?.writeErrors?.length > 0 && error.writeErrors.every((item) => item.err?.code === 11000));

        if (!onlyDuplicates) {
            throw error;
        }

        const partial = error?.result ?? {};

        return (partial.upsertedCount ?? 0) + (partial.modifiedCount ?? 0);
    }
}

/** Označí další požadavek ke zpracování - nejdřív podle priority, při shodě nejstarší. */
async function claimNextJob(filter = {}) {
    return GenerationJob.findOneAndUpdate(
        { ...filter, status: "pending", runAt: { $lte: new Date() } },
        { $set: { status: "processing", processingStartedAt: new Date() } },
        { sort: { priority: -1, runAt: 1, createdAt: 1 }, new: true }
    );
}

/** Označí dávku čekajících požadavků jednoho typu (nejdřív podle priority, při shodě nejstarší). */
async function claimNextJobs(type, limit, minPriority = 0, filter = {}) {
    const jobs = [];

    while (jobs.length < limit) {
        const job = await GenerationJob.findOneAndUpdate(
            { type, status: "pending", runAt: { $lte: new Date() }, priority: { $gte: minPriority }, ...filter },
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
    if (
        model.description?.version === DESCRIPTION_VERSION
        && model.description?.text?.trim()
        && model.description?.textEn?.trim()
    ) {
        return;
    }

    const { description, descriptionEn } = await generateDescription(model);

    await AIModel.updateOne(
        { modelId: job.modelId },
        {
            $set: {
                description: {
                    text: description,
                    textEn: descriptionEn,
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
        if (
            model.description?.version === DESCRIPTION_VERSION
            && model.description?.text?.trim()
            && model.description?.textEn?.trim()
        ) {
            doneJobIds.push(job._id);
            continue;
        }

        toGenerate.push(model);
        generatingJobs.push(job);
    }

    if (toGenerate.length > 0) {
        const generated = await generateDescriptions(toGenerate);
        const generatedById = new Map(generated.map((item) => [item.modelId, item]));

        for (const [modelId, item] of generatedById) {
            await AIModel.updateOne(
                { modelId },
                {
                    $set: {
                        description: {
                            text: item.description,
                            textEn: item.descriptionEn,
                            version: DESCRIPTION_VERSION,
                            status: "ok",
                            generatedAt: new Date(),
                        },
                    },
                }
            );
        }

        for (const job of generatingJobs) {
            const item = generatedById.get(job.modelId);

            if (item?.description && item?.descriptionEn) {
                doneJobIds.push(job._id);
            } else {
                // AI pro model popisek nevrátilo v obou jazycích nebo neprošel kontrolou délky - zkusí se znovu
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

// Typy úkolů, které má tento worker zpracovávat, null znamená všechny
let workerTypes = null;

// Stav workeru - při zastavení se už nesmí přebírat nové úkoly
let workerStopped = false;
let tickInProgress = false;

/** Smí worker zpracovat úkol tohoto typu? */
function isTypeAllowed(type) {
    return !workerTypes || workerTypes.has(type);
}

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

        if (job.isBulk) {
            await recordBulkJobDone(1);
        }
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

        const doneIds = new Set(doneJobIds.map((id) => String(id)));
        const doneBulkCount = jobs.filter((job) => job.isBulk && doneIds.has(String(job._id))).length;

        if (doneBulkCount > 0) {
            await recordBulkJobDone(doneBulkCount);
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

/** Dnešní datum v čase serveru (např. "2026-11-12"). */
function localDateKey() {
    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");

    return `${now.getFullYear()}-${month}-${day}`;
}

// Stav denního rozpočtu držený v paměti, aby se databáze nečetla při každém kroku
let bulkBudgetCache = { checkedAt: 0, date: "", exhausted: false };

/** Zjistí, zda už je denní rozpočet hromadného doplňování vyčerpaný. */
async function isBulkBudgetExhausted() {
    const date = localDateKey();

    if (bulkBudgetCache.date === date && Date.now() - bulkBudgetCache.checkedAt < 30000) {
        return bulkBudgetCache.exhausted;
    }

    let exhausted;

    if (BULK_DAILY_LIMIT <= 0) {
        exhausted = true;
    } else {
        const state = await GenerationState.findById(`bulkDaily:${date}`).lean();

        exhausted = Boolean(state && state.count >= BULK_DAILY_LIMIT);
    }

    bulkBudgetCache = { checkedAt: Date.now(), date, exhausted };

    return exhausted;
}

/** Zapíše zpracované hromadné úlohy do denního rozpočtu. */
async function recordBulkJobDone(count = 1) {
    if (count <= 0 || BULK_DAILY_LIMIT <= 0) {
        return;
    }

    const date = localDateKey();
    const result = await GenerationState.findOneAndUpdate(
        { _id: `bulkDaily:${date}` },
        { $setOnInsert: { key: "bulkDaily", date }, $inc: { count } },
        { upsert: true, new: true }
    );

    bulkBudgetCache = { checkedAt: Date.now(), date, exhausted: result?.count >= BULK_DAILY_LIMIT };
}

/** Jeden krok zpracovatele: uklidí zaseknuté požadavky a obsadí volná místa novými. */
async function tick() {
    if (workerStopped || !SUMMARY_ENABLED || Date.now() < quotaCooldownUntil || Date.now() < rateCooldownUntil) {
        return;
    }

    if (Date.now() - lastReclaimAt > STALE_PROCESSING_MS / 3) {
        lastReclaimAt = Date.now();
        await reclaimStaleJobs();
    }

    while (!workerStopped && runningJobs < MAX_CONCURRENT_JOBS) {
        let batch = [];

        if (isTypeAllowed("description")) {
            // 1) Právě prohlížené modely (uživatel čeká) mají vždy přednost
            batch = await claimNextJobs(
                "description",
                DESCRIPTION_HOT_BATCH_SIZE,
                Date.now() - HOT_JOB_MAX_AGE_MS,
                { isBulk: { $ne: true } }
            );

            // 2) Starší požadavky uživatelů - i ty mají přednost před hromadným doplňováním
            if (batch.length === 0) {
                batch = await claimNextJobs("description", DESCRIPTION_BATCH_SIZE, 0, { isBulk: { $ne: true } });
            }

            // 3) Hromadné doplňování na pozadí - jen v rámci denního rozpočtu
            if (batch.length === 0 && !(await isBulkBudgetExhausted())) {
                batch = await claimNextJobs("description", DESCRIPTION_BATCH_SIZE, 0, { isBulk: true });
            }
        }

        if (batch.length > 1) {
            runningJobs++;
            void runDescriptionBatch(batch);
            continue;
        }

        // Jednotlivé úkoly (přehledy i osamělé popisky): nejdřív požadavky uživatelů,
        // teprve potom hromadné doplňování v rámci denního rozpočtu
        const typeFilter = workerTypes ? { type: { $in: [...workerTypes] } } : {};

        let job = batch[0] ?? (await claimNextJob({ ...typeFilter, isBulk: { $ne: true } }));

        if (!job && !(await isBulkBudgetExhausted())) {
            job = await claimNextJob({ ...typeFilter, isBulk: true });
        }

        if (!job) {
            break;
        }

        runningJobs++;
        void runJob(job);
    }
}

let workerTimer = null;

/** Spustí jeden krok workeru, ale nikdy ne souběžně dva. */
function runTick() {
    if (tickInProgress) {
        return;
    }

    tickInProgress = true;

    tick()
        .catch((error) => console.error("Zpracovatel fronty generování selhal:", error))
        .finally(() => {
            tickInProgress = false;
        });
}

/**
 * Spustí zpracovatele fronty na pozadí. Bez nastaveného poskytovatele se nespustí.
 * Proces (např. skript) skončí, když dodělá svou práci.
 *
 * Volitelně lze omezit typy úkolů, např. { types: ["description"] }.
 */
function startGenerationWorker({ types } = {}) {
    if (!SUMMARY_ENABLED || workerTimer) {
        return;
    }

    workerTypes = Array.isArray(types) && types.length > 0 ? new Set(types) : null;
    workerStopped = false;

    workerTimer = setInterval(runTick, POLL_INTERVAL_MS);
    workerTimer.unref();

    console.log(`Fronta generování běží (souběžně nejvýš ${MAX_CONCURRENT_JOBS} požadavků).`);

    runTick();
}

/**
 * Zastaví zpracovatele a počká, až doběhnou právě zpracovávané úkoly.
 * Používá se ve skriptech před uzavřením databáze.
 */
async function stopGenerationWorker() {
    workerStopped = true;

    if (workerTimer) {
        clearInterval(workerTimer);
        workerTimer = null;
    }

    while (tickInProgress || runningJobs > 0) {
        await new Promise((resolve) => setTimeout(resolve, 100));
    }

    workerTypes = null;
}

module.exports = {
    enqueueJobs,
    startGenerationWorker,
    stopGenerationWorker,
};

