const mongoose = require("mongoose");

const AIModel = require("../models/AIModel");
const {
    DEFAULT_TASKS,
    SORT_PARAMS,
    TAB_SORT_KEYS,
    getModel: fetchHuggingFaceModel,
    getModelCard: fetchHuggingFaceCard,
    getSortedModels,
    getAuthorAvatarUrl,
} = require("../services/huggingFaceService");
const { isValidModel, mapModelData, mapRawModels } = require("../services/modelMapper");
const { getStoredDescriptions } = require("../services/descriptionService");
const { getStoredInsights } = require("../services/insightsService");
const { enqueueJobs } = require("../services/generationQueue");
const { ensureModelsStored, saveAuthorAvatar } = require("../services/modelStore");

// Kolik modelů se vrací na jednu stránku výpisu (klient si o další řekne tlačítkem)
const DEFAULT_PAGE_SIZE = 24;

// Největší počet modelů v jedné odpovědi (musí odpovídat MODELS_MAX_PAGE_SIZE v klientovi)
const MAX_PAGE_SIZE = 100;

// Kolikrát víc modelů se stáhne, když je zvolený jazyk (HF podle jazyka filtrovat neumí)
const LANGUAGE_FILTER_OVERFETCH = 4;

// HF povolí "skip" jen do 3000. položky, výš vrátí chybu (parametr je zastaralý)
const MAX_PAGE_OFFSET = 3000;

/**
 * Porovnávací funkce pro sloučený výpis podle zvoleného řazení.
 * Výchozí je podle počtu stažení; trendingScore nemusejí mít všechny modely,
 * proto chybějící hodnotu nahradí počtem stažení jako rozumným odhadem popularity.
 */
const SORT_COMPARATORS = {
    popularity: (a, b) => (b.trendingScore ?? b.downloads) - (a.trendingScore ?? a.downloads),
    downloads: (a, b) => b.downloads - a.downloads,
    likes: (a, b) => b.likes - a.likes,
    created: (a, b) => new Date(b.publishedAt ?? 0) - new Date(a.publishedAt ?? 0),
};

/** Seřadí sloučené modely podle zvoleného klíče (neznámý klíč = podle počtu stažení). */
const sortMergedModels = (models, sort) =>
    [...models].sort(SORT_COMPARATORS[sort] ?? SORT_COMPARATORS.downloads);

/** Převede opakovatelný parametr dotazu na pole hodnot (např. „?tasks=a&tasks=b“). */
const toArrayParam = (param) => {

    if (Array.isArray(param)) {
        return param.filter((value) => typeof value === "string" && value.length > 0);
    }

    return typeof param === "string" && param.length > 0 ? [param] : [];
};

/** Přečte celočíselný parametr stránkování (neplatná hodnota se nahradí výchozí). */
const readPageParam = (value, fallback, min, max) => {

    const parsed = Number.parseInt(value, 10);

    return Number.isInteger(parsed)
        ? Math.min(Math.max(parsed, min), max)
        : fallback;
};

/** Načte stránku modelů z Hugging Face a zúží ji podle úloh a jazyků. */
const getFilteredModelsFromHuggingFace = async (tasks, languages, limit, paging) => {
    // S vybranými úlohami se Hugging Face dotáže přímo na ně přes pipeline_tag,
    // jinak by se nad filtrem s malým množstvím modelů nenašlo nic (překlad, shrnutí).
    const pages = tasks.length > 0
        // Každá vybraná úloha se stáhne zvlášť a výsledky se sloučí
        ? await Promise.all(
            tasks.map((task) => getSortedModels("downloads", limit, task, paging))
        )
        : [await getSortedModels("downloads", limit, undefined, paging)];

    const models = mapRawModels(pages.flatMap((page) => page.models));

    return {
        // Jazyk se dofiltruje až tady - Hugging Face podle něj filtrovat neumí
        models: languages.length > 0
            ? models.filter((model) =>
                model.languages.some((language) => languages.includes(language))
            )
            : models,
        hasMore: pages.some((page) => page.hasMore),
    };
};

/** Načte model živě z Hugging Face a převede ho na tvar AIModel (když neexistuje, vrátí null). */
const getHuggingFaceModel = async (modelId) => {

    try {
        const model = mapModelData(await fetchHuggingFaceModel(modelId));

        return isValidModel(model) ? model : null;
    } catch (error) {
        console.error(`Model „${modelId}“ se nepodařilo načíst z Hugging Face: ${error.message}`);

        return null;
    }
};

/** Převod modelu na správný tvar pro renderování. */
const toApiModel = (model) => ({
    ...model,
    createdAt: model.publishedAt ?? null,
    description: model.description?.text ?? null,
});

/**
 * Doplní k modelům právě načteným z Hugging Face popisky uložené v databázi.
 * Popisky, které v databázi ještě nejsou, si klient vyžádá zvlášť a server je dogeneruje na pozadí.
 */
const withStoredDescriptions = async (models) => {
    const stored = new Map(
        (await getStoredDescriptions(models.map((model) => model.modelId)))
            .map((item) => [item.modelId, item.description])
    );

    return models.map((model) =>
        stored.has(model.modelId)
            ? { ...model, description: { text: stored.get(model.modelId) } }
            : model
    );
};

const getModels = async (req, res) => {
    try {
        const { sort, tab } = req.query;
        const tasks = toArrayParam(req.query.tasks);
        const languages = toArrayParam(req.query.languages);

        if (sort && !SORT_PARAMS[sort]) {
            return res.status(400).json({
                status: "error",
                error: "Neznámé řazení.",
            });
        }

        if (tab && !Object.hasOwn(TAB_SORT_KEYS, tab)) {
            return res.status(400).json({
                status: "error",
                error: "Neznámý štítek.",
            });
        }

        // Stránkování: klient si vyžádá počet modelů od zadané pozice, nebo naváže kurzorem
        const pageOffset = readPageParam(req.query.offset, 0, 0, MAX_PAGE_OFFSET);
        const pageLimit = readPageParam(req.query.limit, DEFAULT_PAGE_SIZE, 1, MAX_PAGE_SIZE);
        const cursor = typeof req.query.cursor === "string" && req.query.cursor.length > 0
            ? req.query.cursor
            : null;

        // S jazykovým filtrem se stáhne víc modelů, část jich jazyk nesplní
        const fetchLimit = languages.length > 0
            ? Math.min(pageLimit * LANGUAGE_FILTER_OVERFETCH, MAX_PAGE_SIZE)
            : pageLimit;

        // Řazený výpis se načte z Hugging Face, filtry se zachovají nad výslednými modely.
        if (sort) {
            // Štítek určuje, ze kterého výpisu se vybírá, řazení se použije až nad nimi
            const poolSort = TAB_SORT_KEYS[tab] ?? sort;

            // Kurzor platí pro jeden výpis, s víc úlohami se stránkuje přeskočením
            const paging = { skip: pageOffset, cursor: tasks.length > 1 ? null : cursor };

            // HF vrátí rovnou požadovanou stránku, nic se nedotahuje navíc
            const pages = tasks.length > 0
                ? await Promise.all(
                    tasks.map((task) => getSortedModels(poolSort, fetchLimit, task, paging))
                )
                : [await getSortedModels(poolSort, fetchLimit, undefined, paging)];

            // Sloučené výpisy jednotlivých úloh se znovu seřadí podle zvoleného klíče,
            // aby pořadí odpovídalo řazení a ne tomu, v jakém pořadí se úlohy načetly
            let models = sortMergedModels(
                mapRawModels(pages.flatMap((page) => page.models).filter(Boolean)),
                sort
            );

            if (languages.length > 0) {
                models = models.filter((model) =>
                    model.languages.some((language) => languages.includes(language))
                );
            }

            const pageModels = models.slice(0, pageLimit);

            // Další stránka se ukáže, jen když ji HF ohlašuje a něco se vrátilo
            const hasMore = pageModels.length > 0 && pages.some((page) => page.hasMore);

            // Kurzor na další stránku, u víc úloh se cursory rozcházejí, proto se nepoužije
            const nextCursor = tasks.length > 1 ? null : pages[0]?.nextCursor ?? null;

            // Avatary se k výpisu nedotahují - klient si je načte zvlášť na pozadí,
            // aby stahování stránek autorů nezdržovalo zobrazení modelů.
            // Ukládají se jen modely vrácené na stránce, ne celý stažený objem.
            await ensureModelsStored(pageModels);

            // Uložené popisky se přidají rovnou k výpisu, aby se nežádaly znovu
            const modelsWithDescriptions = await withStoredDescriptions(pageModels);

            return res.status(200).json({
                status: "ok",
                data: modelsWithDescriptions.map((model) => toApiModel({ ...model, _id: model.modelId, avatarUrl: null })),
                meta: { offset: pageOffset, limit: pageLimit, hasMore, nextCursor },
            });
        }

        // Bez filtrů se vrací importované modely z databáze, s filtry se načtou živě z Hugging Face.
        const fromDatabase = tasks.length === 0 && languages.length === 0;

        if (fromDatabase) {
            // Z databáze se stránkuje přímo dotazem (o jeden model víc kvůli zjištění další stránky)
            const models = await AIModel.find({}, { insights: 0 })
                .sort({ downloads: -1 })
                .skip(pageOffset)
                .limit(pageLimit + 1)
                .lean();

            const hasMore = models.length > pageLimit;
            const pageModels = models.slice(0, pageLimit);

            return res.status(200).json({
                status: "ok",
                data: pageModels.map(toApiModel),
                meta: { offset: pageOffset, limit: pageLimit, hasMore },
            });
        }

        const { models, hasMore: hasMoreModels } = await getFilteredModelsFromHuggingFace(
            tasks,
            languages,
            fetchLimit,
            { skip: pageOffset }
        );

        const pageModels = models.slice(0, pageLimit);

        // Další stránka se ukáže, jen když ji HF ohlašuje a něco se vrátilo
        const hasMore = pageModels.length > 0 && hasMoreModels;

        await ensureModelsStored(pageModels);

        const modelsWithDescriptions = await withStoredDescriptions(pageModels);

        return res.status(200).json({
            status: "ok",
            data: modelsWithDescriptions.map((model) => toApiModel({ ...model, avatarUrl: null })),
            meta: { offset: pageOffset, limit: pageLimit, hasMore },
        });
    } catch (error) {
        console.error("Fetching models failed:", error);

        return res.status(500).json({
            status: "error",
            error: "Fetching models failed.",
        });
    }
};

const getModel = async (req, res) => {
    try {
        const { modelId } = req.params;

        // Detail lze načíst podle MongoDB identifikátoru i podle id modelu na Hugging Face
        const query = mongoose.Types.ObjectId.isValid(modelId)
            ? { _id: modelId }
            : { modelId };

        let model = await AIModel.findOne(query, { insights: 0 }).lean();

        // Model, který dosud není v databázi, se zkusí načíst živě z Hugging Face
        if (!model && !mongoose.Types.ObjectId.isValid(modelId)) {
            model = await getHuggingFaceModel(modelId);

            if (model) {
                // Uloží se, aby k němu šly doplnit popisky a přehledy
                await ensureModelsStored([model]);
            }
        }

        if (!model) {
            return res.status(404).json({
                status: "error",
                error: "Model nebyl nalezen.",
            });
        }

        return res.status(200).json({
            status: "ok",
            data: toApiModel(model),
        });
    } catch (error) {
        console.error("Fetching model failed:", error);

        return res.status(500).json({
            status: "error",
            error: "Fetching model failed.",
        });
    }
};

const getAvatar = async (req, res) => {
    try {
        const { author } = req.params;

        if (!author) {
            return res.status(400).json({
                status: "error",
                error: "Chybí autor.",
            });
        }

        const avatarUrl = await getAuthorAvatarUrl(author);

        // Adresa se uloží k modelům autora, aby se příště nemusela dotahovat
        await saveAuthorAvatar(author, avatarUrl);

        return res.status(200).json({
            status: "ok",
            data: { avatarUrl },
        });
    } catch (error) {
        console.error("Fetching avatar failed:", error);

        return res.status(500).json({
            status: "error",
            error: "Fetching avatar failed.",
        });
    }
};

/**
 * Vrátí hotové popisky k modelům, které aplikace právě zobrazuje.
 * Samotné generování běží na pozadí ve frontě - požadavek jen přečte,
 * co už je v databázi, chybějící popisky zařadí ke zpracování a hned odpoví.
 */
const createDescriptions = async (req, res) => {
    try {
        const models = Array.isArray(req.body?.models) ? req.body.models : [];
        const modelIds = models.map((model) => model?.modelId).filter(Boolean);

        const descriptions = await getStoredDescriptions(modelIds);
        const readyIds = new Set(descriptions.map((item) => item.modelId));

        // Chybějící popisky se doplní na pozadí - klient je uvidí při dalším načtení
        await enqueueJobs("description", modelIds.filter((modelId) => !readyIds.has(modelId)));

        return res.status(200).json({
            status: "ok",
            data: descriptions,
        });
    } catch (error) {
        console.error("Reading descriptions failed:", error);

        return res.status(500).json({
            status: "error",
            error: "Reading descriptions failed.",
        });
    }
};

/** Načte text model card (README) modelu z Hugging Face. */
const getModelCard = async (req, res) => {
    try {
        const { modelId } = req.params;

        if (!modelId) {
            return res.status(400).json({
                status: "error",
                error: "Chybí identifikátor modelu.",
            });
        }

        const content = await fetchHuggingFaceCard(modelId);

        return res.status(200).json({
            status: "ok",
            data: { modelId, content },
        });
    } catch (error) {
        console.error("Fetching model card failed:", error);

        return res.status(500).json({
            status: "error",
            error: "Fetching model card failed.",
        });
    }
};

/**
 * Vrátí hotové přehledy z dokumentace modelu.
 * Samotná příprava běží na pozadí ve frontě - požadavek jen přečte, co už je
 * v databázi, chybějící přehledy zařadí ke zpracování a hned odpoví
 * (bez přehledů stránka funguje dál se základními údaji).
 */
const createInsights = async (req, res) => {
    try {
        const { modelId } = req.params;

        if (!modelId) {
            return res.status(400).json({
                status: "error",
                error: "Chybí identifikátor modelu.",
            });
        }

        // Adresa může obsahovat databázové id i identifikátor modelu na Hugging Face,
        // dokumentace se ale hledá podle identifikátoru z Hugging Face
        const query = mongoose.Types.ObjectId.isValid(modelId) ? { _id: modelId } : { modelId };
        const stored = await AIModel.findOne(query, { modelId: 1 }).lean();

        const resolvedModelId = stored?.modelId ?? modelId;
        const insights = await getStoredInsights(resolvedModelId);

        if (!insights) {
            // Přehledy se připraví na pozadí - klient je uvidí při dalším otevření detailu
            await enqueueJobs("insights", [resolvedModelId]);
        }

        return res.status(200).json({
            status: "ok",
            data: { modelId, insights },
        });
    } catch (error) {
        console.error("Reading insights failed:", error);

        return res.status(500).json({
            status: "error",
            error: "Reading insights failed.",
        });
    }
};

module.exports = {
    getModels,
    getModel,
    getModelCard,
    getAvatar,
    createDescriptions,
    createInsights,
};
