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

// Obrázek převzatý z dokumentace modelu (diagram, ukázka výsledků)
const imageSchema = new mongoose.Schema(
    {
        url: {
            type: String,
            required: true,
            trim: true,
        },
        alt: {
            type: String,
            trim: true,
        },
        // Nadpis, pod kterým obrázek v dokumentaci stojí
        caption: {
            type: String,
            trim: true,
        },
    },
    {
        _id: false,
    }
);

// Video převzaté z dokumentace modelu
const videoSchema = new mongoose.Schema(
    {
        url: {
            type: String,
            required: true,
            trim: true,
        },
        title: {
            type: String,
            trim: true,
        },
        // Náhledový obrázek, pokud ho dokumentace nebo videoportál poskytuje
        thumbnail: {
            type: String,
            trim: true,
        },
    },
    {
        _id: false,
    }
);

// Vygenerovaný český popis modelu
const descriptionSchema = new mongoose.Schema(
    {
        text: {
            type: String,
            trim: true,
        },
        // Verze zadání, podle které popisek vznikl - při změně zadání se popisek přegeneruje
        version: {
            type: String,
            trim: true,
        },
        // ok = popisek je hotový, failed = generování se nepodařilo
        status: {
            type: String,
            enum: ["ok", "failed"],
            default: "ok",
        },
        generatedAt: {
            type: Date,
            default: null,
        },
    },
    {
        _id: false,
    }
);

// Vygenerované české přehledy z dokumentace
const insightsSchema = new mongoose.Schema(
    {
        // Označení zadání vstupu, ze kterého hodnoty vznikly - při změně zadání nebo dokumentace se vytvoří znovu
        sourceFingerprint: {
            type: String,
            trim: true,
        },
        // ok = přehledy jsou hotové, failed = generování se nepodařilo
        status: {
            type: String,
            enum: ["ok", "failed"],
            default: "ok",
        },
        generatedAt: {
            type: Date,
            default: null,
        },
        // Konkrétní vlastnosti, kterými se model odlišuje
        highlights: {
            type: [String],
            default: [],
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
        // Verze nebo označení vydání modelu, pokud ji dokumentace uvádí
        version: {
            type: String,
            trim: true,
        },
        // Model, ze kterého tento vychází (u odvozených modelů)
        baseModel: {
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
        // Nároky na hardware nebo prostředí, které dokumentace uvádí
        hardwareRequirements: {
            type: [String],
            default: [],
        },
        // Kvantizace nebo formáty, které dokumentace uvádí (fp16, int8, GGUF…)
        quantization: {
            type: [String],
            default: [],
        },
        // S čím je model kompatibilní nebo co vyžaduje
        compatibility: {
            type: [String],
            default: [],
        },
        // Výsledky benchmarků, které dokumentace modelu uvádí
        benchmarks: {
            type: [benchmarkSchema],
            default: [],
        },
        // Obrázky z dokumentace modelu (diagramy, ukázky výsledků)
        images: {
            type: [imageSchema],
            default: [],
        },
        // Videa z dokumentace modelu (mp4, YouTube)
        videos: {
            type: [videoSchema],
            default: [],
        },
    },
    {
        _id: false,
    }
);


const aiModelSchema = new mongoose.Schema(
    {
        // Identifikátor modelu na Hugging Face (např. meta-llama/Llama-3.1-8B-Instruct)
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
        // Skóre trendů z Hugging Face (nemá ho každý model)
        trendingScore: {
            type: Number,
            default: null,
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
        // Kdy model vznikl na Hugging Face (odlišné od createdAt, což je čas uložení v databázi)
        publishedAt: {
            type: Date,
            default: null,
        },
        lastModified: {
            type: Date,
            default: null,
        },
        // Kdy se naposledy obnovily statistiky z Hugging Face
        statsUpdatedAt: {
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
        // Vygenerovaný český popis do karty modelu
        description: {
            type: descriptionSchema,
            default: null,
        },
        // Vygenerované české přehledy z dokumentace modelu
        insights: {
            type: insightsSchema,
            default: null,
        },
    },
    {
        // Vlastní kolekce pro skutečná data modelů z Hugging Face
        collection: "models",
        timestamps: true,
    }
);

// Indexy pro řazení a filtrování modelů v katalogu
aiModelSchema.index({ downloads: -1 });
aiModelSchema.index({ likes: -1 });
aiModelSchema.index({ trendingScore: -1, downloads: -1 });
aiModelSchema.index({ publishedAt: -1 });
aiModelSchema.index({ lastModified: -1 });
aiModelSchema.index({ task: 1, downloads: -1 });
aiModelSchema.index({ languages: 1, downloads: -1 });
aiModelSchema.index({ tags: 1, downloads: -1 });
aiModelSchema.index({ library: 1, downloads: -1 });
aiModelSchema.index({ license: 1, downloads: -1 });
aiModelSchema.index({ author: 1, downloads: -1 });
// Podle stavu popisu se dohledávají modely, kterým se má text doplnit
aiModelSchema.index({ "description.status": 1 });

module.exports = mongoose.model("AIModel", aiModelSchema);
