/**
 * Předgenerování českých popisků do databáze (npm run prewarm:descriptions).
 *
 * Na rozdíl od generate:content řeší jen popisky a umí vybrat pouze modely,
 * které aplikace zobrazuje jako první. Hotové popisky se uloží do databáze,
 * takže je aplikace při otevření jen přečte a nic negeneruje.
 *
 * Příklady:
 *   npm run prewarm:descriptions -- --limit=100
 *   npm run prewarm:descriptions -- --from-api=https://ai-modely-api.onrender.com --limit=100
 *   npm run prewarm:descriptions -- --all
 *
 * Skript zapisuje do databáze uvedené v MONGO_URI. Před spuštěním proti
 * produkci zkontrolujte, že .env míří na správnou databázi.
 */

const mongoose = require("mongoose");

const connectDatabase = require("../config/database");
const { SUMMARY_ENABLED } = require("../config/env");
const AIModel = require("../models/AIModel");
const GenerationJob = require("../models/GenerationJob");
const { DESCRIPTION_VERSION } = require("../services/descriptionService");
const { enqueueJobs, startGenerationWorker, stopGenerationWorker } = require("../services/generationQueue");

// Kolik chybějících popisků se ve výchozím stavu předgeneruje (0 nebo --all = všechny)
const DEFAULT_LIMIT = 100;

// Jak často se hlásí průběh a jak dlouho se čeká na dokončení fronty
const PROGRESS_INTERVAL_MS = 5000;
const DEFAULT_TIMEOUT_MINUTES = 30;

// Podle čeho se vybírají modely k předgenerování (odpovídá řazením ve výpisu)
const SORT_COMPARATORS = {
    downloads: (a, b) => (b.downloads ?? 0) - (a.downloads ?? 0),
    likes: (a, b) => (b.likes ?? 0) - (a.likes ?? 0),
    created: (a, b) => new Date(b.publishedAt ?? 0) - new Date(a.publishedAt ?? 0),
    trending: (a, b) => (b.trendingScore ?? 0) - (a.trendingScore ?? 0),
};

/** Načte hodnotu argumentu ve tvaru --název=hodnota. */
function getArg(name) {
    const prefix = `--${name}=`;
    const argument = process.argv.slice(2).find((value) => value.startsWith(prefix));

    return argument ? argument.slice(prefix.length) : undefined;
}

/** Zjistí, zda byl předán přepínač (např. --all). */
function hasFlag(name) {
    return process.argv.slice(2).includes(`--${name}`);
}

/** Počká zadanou dobu (ms). */
function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Má model popisek aktuální verze? */
function hasCurrentDescription(model) {
    return model.description?.version === DESCRIPTION_VERSION && Boolean(model.description?.text?.trim());
}

/**
 * Načte identifikátory modelů, které právě vrací běžící aplikace.
 * Díky tomu se předgenerují přesně ty modely, které návštěvník uvidí první.
 */
async function getModelIdsFromApi(baseUrl) {
    // limit=100 je největší stránka, kterou API vrací
    const url = `${baseUrl.replace(/\/+$/, "")}/api/models?sort=popularity&tab=all&limit=100`;
    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(`API ${url} vrátilo chybu ${response.status}.`);
    }

    const body = await response.json();
    const models = Array.isArray(body?.data) ? body.data : [];

    return models
        .map((model) => model?.modelId)
        .filter((modelId) => typeof modelId === "string" && modelId.length > 0);
}

/** Vybere modely bez aktuálního popisku, nejdřív ty nejsledovanější. */
async function selectModels() {
    const models = await AIModel.find(
        {},
        { modelId: 1, description: 1, downloads: 1, likes: 1, publishedAt: 1, trendingScore: 1 }
    ).lean();
    const missing = models.filter((model) => !hasCurrentDescription(model));

    let selected = missing;

    // Volitelně se výběr zúží na modely, které vrací produkční API
    const apiUrl = getArg("from-api");

    if (apiUrl) {
        const apiModelIds = new Set(await getModelIdsFromApi(apiUrl));

        selected = selected.filter((model) => apiModelIds.has(model.modelId));
    }

    // Přednostně se generují modely, které se ve výpisu zobrazují první
    const sort = getArg("sort") ?? "downloads";
    selected.sort(SORT_COMPARATORS[sort] ?? SORT_COMPARATORS.downloads);

    const limitArg = getArg("limit");
    const limit = limitArg === undefined ? DEFAULT_LIMIT : Number(limitArg);

    if (!hasFlag("all") && Number.isFinite(limit) && limit > 0) {
        selected = selected.slice(0, limit);
    }

    return { total: models.length, missingCount: missing.length, selected, sort };
}

/**
 * Počká, až se vybrané popisky doplní nebo dokud nevyprší časový limit.
 * Vrací počty hotových a nezdařených popisků.
 */
async function waitForDescriptions(modelIds, timeoutMinutes) {
    const startedAt = Date.now();
    let lastReportAt = 0;

    for (;;) {
        const [remaining, failed, ready] = await Promise.all([
            GenerationJob.countDocuments({
                type: "description",
                modelId: { $in: modelIds },
                status: { $in: ["pending", "processing"] },
            }),
            GenerationJob.countDocuments({
                type: "description",
                modelId: { $in: modelIds },
                status: "failed",
            }),
            AIModel.countDocuments({
                modelId: { $in: modelIds },
                "description.version": DESCRIPTION_VERSION,
                "description.text": { $nin: [null, ""] },
            }),
        ]);

        if (Date.now() - lastReportAt >= PROGRESS_INTERVAL_MS || remaining === 0) {
            lastReportAt = Date.now();
            console.log(`Hotovo ${ready}/${modelIds.length}, zbývá ${remaining}, nezdařeno ${failed}.`);
        }

        if (remaining === 0) {
            return { ready, failed };
        }

        if (Date.now() - startedAt > timeoutMinutes * 60 * 1000) {
            console.log(
                `\nČasový limit vypršel. Zbývající úkoly (${remaining}) zůstávají ve frontě ` +
                "a dokončí je další spuštění skriptu."
            );

            return { ready, failed };
        }

        await sleep(PROGRESS_INTERVAL_MS);
    }
}

async function prewarmDescriptions() {
    if (!SUMMARY_ENABLED) {
        console.error("Generování je vypnuté - chybí SUMMARY_API_KEY nebo GROQ_API_KEY v souboru .env.");
        process.exitCode = 1;

        return;
    }

    await connectDatabase();

    try {
        const { total, missingCount, selected, sort } = await selectModels();

        console.log(`V databázi je ${total} modelů, bez aktuálního popisku je ${missingCount}.`);
        console.log(`Vybrané modely k předgenerování: ${selected.length} (řazení: ${sort}).`);

        if (selected.length === 0) {
            console.log("Není co generovat - všechny vybrané modely už popisek mají.");

            return;
        }

        console.log(`První vybrané modely: ${selected.slice(0, 5).map((model) => model.modelId).join(", ")}`);

        if (hasFlag("dry-run")) {
            console.log("\nZkušební režim: nic se nezařadilo ani nevygenerovalo.");

            return;
        }

        const modelIds = selected.map((model) => model.modelId);
        const enqueued = await enqueueJobs("description", modelIds);

        console.log(`Do fronty zařazeno ${enqueued} popisků.`);

        startGenerationWorker({ types: ["description"] });

        const timeoutMinutes = Number(getArg("timeout")) || DEFAULT_TIMEOUT_MINUTES;
        const result = await waitForDescriptions(modelIds, timeoutMinutes);

        console.log(`\nPředgenerování hotové: ${result.ready}/${modelIds.length} popisků je v databázi.`);

        if (result.failed > 0) {
            console.log(`Nezdařené úkoly (${result.failed}) najdete v kolekci generationjobs.`);
            process.exitCode = 1;
        }
    } finally {
        // Worker musí doběhnout dřív, než se uzavře databáze
        try {
            await stopGenerationWorker();
        } finally {
            await mongoose.connection.close();
            console.log("Spojení s databází bylo ukončeno.");
        }
    }
}

prewarmDescriptions().catch((error) => {
    console.error("Předgenerování popisků selhalo:", error);
    process.exitCode = 1;
});
