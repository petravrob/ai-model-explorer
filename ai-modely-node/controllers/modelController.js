const mongoose = require("mongoose");

const AIModel = require("../models/AIModel");
const {
    DEFAULT_TASKS,
    SORT_PARAMS,
    TAB_SORT_KEYS,
    getModels: fetchHuggingFaceModels,
    getAllModels,
    getModel: fetchHuggingFaceModel,
    getModelCard: fetchHuggingFaceCard,
    getSortedModels,
    getAuthorAvatarUrl,
} = require("../services/huggingFaceService");
const { isValidModel, mapModelData, mapRawModels } = require("../services/modelMapper");
const { generateDescriptions } = require("../services/descriptionService");
const { generateInsights } = require("../services/insightsService");
const { ensureModelsStored, saveAuthorAvatar } = require("../services/modelStore");

// Kolik modelů se načte z Hugging Face pro filtrování na serveru (větší objem zbytečně prodlužoval načtení)
const FILTERED_MODELS_LIMIT = 100;

// Kolik nejstaženějších modelů se načte pro každou vybranou úlohu při filtrování
const FILTERED_MODELS_PER_TASK = 40;

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

/** Načte modely živě z Hugging Face a zúží je podle zvolených filtrů (úlohy, jazyky). */
const getFilteredModelsFromHuggingFace = async (tasks, languages) => {
    // S vybranými úlohami se Hugging Face dotáže přímo na ně přes pipeline_tag,
    // jinak by se nad filtrem s malým množství modelů nenašlo nic (překlad, shrnutí).
    let models;

    if (tasks.length > 0) {
        // Každá vybraná úloha se stáhne zvlášť a výsledky se sloučí
        const taskResults = await Promise.all(
            tasks.map((task) =>
                fetchHuggingFaceModels({ tasks: [task], limitPerTask: FILTERED_MODELS_PER_TASK })
            )
        );

        models = mapRawModels(taskResults.flat());
    } else {
        const allModels = await getAllModels(FILTERED_MODELS_LIMIT);

        models = mapRawModels(Array.isArray(allModels) ? allModels : []);
    }

    if (languages.length > 0) {
        models = models.filter((model) =>
            model.languages.some((language) => languages.includes(language))
        );
    }

    return models;
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

        // Řazený výpis se načte z Hugging Face, filtry se zachovají nad výslednými modely.
        if (sort) {
            // Štítek určuje, ze kterého výpisu se modely vyberou (např. "nové" z nejnovějších),
            // zvolené řazení se pak použije až nad takto vybranými modely. Klient řazení posílá vždy.
            const poolSort = TAB_SORT_KEYS[tab] ?? sort;

            // S vybranými úlohami se Hugging Face dotáže na každou zvlášť (pipeline_tag),
            // jinak se načte celek seřazený podle klíče. Filtrovat úlohy až nad malým
            // celkovým výpisem by pro méně časté úlohy (překlad, shrnutí…) nenašlo nic.
            const rawResults = tasks.length > 0
                ? await Promise.all(
                    tasks.map((task) =>
                        getSortedModels(poolSort, FILTERED_MODELS_PER_TASK, task)
                    )
                )
                : [await getSortedModels(poolSort)];

            // Sloučené výpisy jednotlivých úloh se znovu seřadí podle zvoleného klíče,
            // aby pořadí odpovídalo řazení a ne tomu, v jakém pořadí se úlohy načetly
            let models = sortMergedModels(
                mapRawModels(rawResults.flat().filter(Boolean)),
                sort
            );

            if (languages.length > 0) {
                models = models.filter((model) =>
                    model.languages.some((language) => languages.includes(language))
                );
            }

            // Avatary se k výpisu nedotahují - klient si je načte zvlášť na pozadí,
            // aby stahování stránek autorů nezdržovalo zobrazení modelů.
            // Ukládání modelů.
            await ensureModelsStored(models);

            return res.status(200).json({
                status: "ok",
                data: models.map((model) => toApiModel({ ...model, _id: model.modelId, avatarUrl: null })),
            });
        }

        // Bez filtrů se vrací importované modely z databáze, s filtry se načtou živě z Hugging Face.
        const fromDatabase = tasks.length === 0 && languages.length === 0;

        const models = fromDatabase
            ? await AIModel.find({}, { insights: 0 }).sort({ downloads: -1 }).lean()
            : await getFilteredModelsFromHuggingFace(tasks, languages);

        if (!fromDatabase) {
            // Ukládání modelů
            await ensureModelsStored(models);
        }

        const responseModels = models.map((model) =>
            fromDatabase ? toApiModel(model) : toApiModel({ ...model, avatarUrl: null })
        );

        return res.status(200).json({
            status: "ok",
            data: responseModels,
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

/** Vygeneruje popisky pro modely, které aplikace právě zobrazuje. */
const createDescriptions = async (req, res) => {
    try {
        const models = Array.isArray(req.body?.models) ? req.body.models : [];
        const descriptions = await generateDescriptions(models);

        return res.status(200).json({
            status: "ok",
            data: descriptions,
        });
    } catch (error) {
        console.error("Generating descriptions failed:", error);

        return res.status(500).json({
            status: "error",
            error: "Generating descriptions failed.",
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

/** Připraví české přehledy z dokumentace modelu na Hugging Face. */
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
        // dokumentaci je ale vždy potřeba hledat podle identifikátoru z Hugging Face
        const query = mongoose.Types.ObjectId.isValid(modelId) ? { _id: modelId } : { modelId };
        const stored = await AIModel.findOne(query, { modelId: 1 }).lean();

        const insights = await generateInsights(stored?.modelId ?? modelId);

        return res.status(200).json({
            status: "ok",
            data: { modelId, insights },
        });
    } catch (error) {
        console.error("Generating insights failed:", error);

        return res.status(500).json({
            status: "error",
            error: "Generating insights failed.",
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
