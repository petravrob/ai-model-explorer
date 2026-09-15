const mongoose = require("mongoose");

const AIModel = require("../models/AIModel");
const {
    DEFAULT_TASKS,
    SORT_PARAMS,
    getModels: fetchHuggingFaceModels,
    getModel: fetchHuggingFaceModel,
    getSortedModels,
} = require("../services/huggingFaceService");
const { isValidModel, mapModelData, mapRawModels } = require("../services/modelMapper");

/** Převede opakovatelný parametr dotazu na pole hodnot (např. „?tasks=a&tasks=b“). */
const toArrayParam = (param) => {

    if (Array.isArray(param)) {
        return param.filter((value) => typeof value === "string" && value.length > 0);
    }

    return typeof param === "string" && param.length > 0 ? [param] : [];
};

/** Načte modely živě z Hugging Face a zúží je podle zvolených filtrů (úlohy, jazyky). */
const getFilteredModelsFromHuggingFace = async (tasks, languages) => {

    const rawModels = await fetchHuggingFaceModels({
        tasks: tasks.length > 0 ? tasks : DEFAULT_TASKS,
    });

    const models = mapRawModels(rawModels);

    // Jazyky Hugging Face filtrovat neumí, zúží se až z převedených dat modelů
    if (languages.length === 0) {
        return models;
    }

    return models.filter((model) =>
        model.languages.some((language) => languages.includes(language))
    );
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

const getModels = async (req, res) => {
    try {
        const { sort } = req.query;
        const tasks = toArrayParam(req.query.tasks);
        const languages = toArrayParam(req.query.languages);

        if (sort && !SORT_PARAMS[sort]) {
            return res.status(400).json({
                status: "error",
                error: "Neznámé řazení.",
            });
        }

        // Řazený výpis se načte z Hugging Face, filtry se zachovají nad výslednými modely.
        if (sort) {
            let models = (await getSortedModels(sort))
                .map(mapModelData)
                .filter(isValidModel);

            if (tasks.length > 0) {
                models = models.filter((model) => tasks.includes(model.task));
            }

            if (languages.length > 0) {
                models = models.filter((model) =>
                    model.languages.some((language) => languages.includes(language))
                );
            }

            return res.status(200).json({
                status: "ok",
                data: models.map((model) => ({ ...model, _id: model.modelId })),
            });
        }

        // Bez filtrů se vrací importované modely z databáze, s filtry se načtou živě z Hugging Face.
        const models = tasks.length === 0 && languages.length === 0
            ? await AIModel.find().sort({ downloads: -1 })
            : await getFilteredModelsFromHuggingFace(tasks, languages);

        return res.status(200).json({
            status: "ok",
            data: models,
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

        let model = await AIModel.findOne(query);

        // Model, který dosud není v databázi, se zkusí načíst živě z Hugging Face
        if (!model && !mongoose.Types.ObjectId.isValid(modelId)) {
            model = await getHuggingFaceModel(modelId);
        }

        if (!model) {
            return res.status(404).json({
                status: "error",
                error: "Model nebyl nalezen.",
            });
        }

        return res.status(200).json({
            status: "ok",
            data: model,
        });
    } catch (error) {
        console.error("Fetching model failed:", error);

        return res.status(500).json({
            status: "error",
            error: "Fetching model failed.",
        });
    }
};

module.exports = {
    getModels,
    getModel,
};
