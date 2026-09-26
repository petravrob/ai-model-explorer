const mongoose = require("mongoose");

const aiModelSchema = new mongoose.Schema(
    {
        // Identifikátor modelu na Hugging Face (např. „meta-llama/Llama-3.1-8B-Instruct“)
        modelId: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        name: {
            type: String,
            required: true,
            trim: true,
        },
        author: {
            type: String,
            required: true,
            trim: true,
        },
        task: {
            type: String,
            required: true,
            trim: true,
        },
        languages: {
            type: [String],
            default: [],
        },
        parameters: {
            type: Number,
            default: null,
        },
        downloads: {
            type: Number,
            required: true,
            min: 0,
            default: 0,
        },
        likes: {
            type: Number,
            required: true,
            min: 0,
            default: 0,
        },
        tags: {
            type: [String],
            default: [],
        },
        // Krátký český popis do karty modelu (doplňuje ho skript scripts/generateDescriptions.js)
        description: {
            type: String,
            default: null,
            trim: true,
        },
        license: {
            type: String,
            default: null,
            trim: true,
        },
        library: {
            type: String,
            default: null,
            trim: true,
        },
        lastModified: {
            type: Date,
            default: null,
        },
        url: {
            type: String,
            required: true,
            trim: true,
        },
        avatarUrl: {
            type: String,
            default: null,
            trim: true,
        },
    },
    {
        // Vlastní kolekce pro skutečná data modelů z Hugging Face
        collection: "models",
        timestamps: true,
    }
);

module.exports = mongoose.model("AIModel", aiModelSchema);
