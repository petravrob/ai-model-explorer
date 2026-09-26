const mongoose = require("mongoose");

// Jeden výsledek benchmarku tak, jak ho uvádí dokumentace modelu
const benchmarkSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        score: {
            type: String,
            trim: true,
        },
        metric: {
            type: String,
            trim: true,
        },
        category: {
            type: String,
            trim: true,
        },
        context: {
            type: String,
            trim: true,
        },
    },
    {
        _id: false,
    }
);

// České přehledy z dokumentace se ukládají zvlášť, aby se dokumentace nezpracovávala víckrát
const modelInsightsSchema = new mongoose.Schema(
    {
        modelId: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        // Otisk vstupu, ze kterého přehledy vznikly – při změně zadání nebo dokumentace se vytvoří znovu
        sourceFingerprint: {
            type: String,
            trim: true,
        },
        overview: {
            type: String,
            trim: true,
        },
        bestFor: {
            type: [String],
            default: [],
        },
        capabilities: {
            type: [String],
            default: [],
        },
        inferenceFrameworks: {
            type: [String],
            default: [],
        },
        contextLength: {
            type: String,
            trim: true,
        },
        limitations: {
            type: [String],
            default: [],
        },
        // Výsledky benchmarků, které dokumentace modelu uvádí
        benchmarks: {
            type: [benchmarkSchema],
            default: [],
        },
    },
    {
        collection: "modelInsights",
        timestamps: true,
    }
);

module.exports = mongoose.model("ModelInsights", modelInsightsSchema);
