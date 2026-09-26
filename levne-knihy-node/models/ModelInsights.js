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
        // Konkrétní typy použití, které dokumentace uvádí
        useCases: {
            type: [String],
            default: [],
        },
        // Druhy vstupů a výstupů podle dokumentace (text, obrázky, zvuk, video…)
        modalities: {
            type: [String],
            default: [],
        },
        // Stručná informace o architektuře, pokud ji dokumentace uvádí
        architecture: {
            type: String,
            trim: true,
        },
        // Aktivní parametry u modelů typu MoE, pokud je dokumentace uvádí
        activeParameters: {
            type: String,
            trim: true,
        },
        // Způsob tréninku, pokud ho dokumentace výslovně uvádí (např. destilace, RL)
        trainingMethod: {
            type: String,
            trim: true,
        },
        // Varianty nebo velikosti modelu, které dokumentace uvádí
        variants: {
            type: [String],
            default: [],
        },
        // Konkrétní doporučené hodnoty, pokud je dokumentace uvádí
        recommendedSettings: {
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
