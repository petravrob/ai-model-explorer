const mongoose = require("mongoose");

const AIModel = require("../models/AIModel");
const { SORT_PARAMS, getModel: getHuggingFaceModel, getSortedModels } = require("../services/huggingFaceService");
const { isValidModel, mapModelData } = require("../services/modelMapper");

const getModels = async (req, res) => {
    try {
        const { sort } = req.query;

        // Seřazený výpis se načte přímo z Hugging Face, databáze obsahuje jen část modelů
        if (sort) {

            if (!SORT_PARAMS[sort]) {
                return res.status(400).json({
                    status: "error",
                    error: "Neznámé řazení.",
                });
            }

            const rawModels = await getSortedModels(sort);

            // Modely z Hugging Face nemají identifikátor databáze, použije se modelId
            const models = rawModels
                .map(mapModelData)
                .filter(isValidModel)
                .map((model) => ({ ...model, _id: model.modelId }));

            return res.status(200).json({
                status: "ok",
                data: models,
            });
        }

        const models = await AIModel.find().sort({ downloads: -1 });

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

        // Model ze seřazeného výpisu nemusí být v databázi, dotáhne se přímo z Hugging Face
        if (!model && !mongoose.Types.ObjectId.isValid(modelId)) {
            try {
                const rawModel = await getHuggingFaceModel(modelId);
                const mappedModel = mapModelData(rawModel);

                if (isValidModel(mappedModel)) {
                    model = { ...mappedModel, _id: mappedModel.modelId };
                }
            } catch (huggingFaceError) {
                console.error("Fetching model from Hugging Face failed:", huggingFaceError);
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
