const mongoose = require("mongoose");

const AIModel = require("../models/AIModel");

const getModels = async (req, res) => {
    try {
        const models = await AIModel.find();

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

        if (!mongoose.Types.ObjectId.isValid(modelId)) {
            return res.status(404).json({
                status: "error",
                error: "Model nebyl nalezen.",
            });
        }

        const model = await AIModel.findById(modelId);

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
