const mongoose = require("mongoose");

// Úkol na pozadí: doplnění českého popisku nebo přehledů k modelu.
// Fronta je uložená v databázi, takže přežije restart serveru a sdílí ji
// všechny instance - o práci se nepřijde ani při pádu procesu.
const generationJobSchema = new mongoose.Schema(
    {
        // Co se má vygenerovat (popisek do karty, nebo přehledy z dokumentace)
        type: {
            type: String,
            enum: ["description", "insights"],
            required: true,
        },
        // Identifikátor modelu na Hugging Face (např. meta-llama/Llama-3.1-8B-Instruct)
        modelId: {
            type: String,
            required: true,
            trim: true,
        },
        // pending = čeká na zpracování, processing = právě se generuje,
        // failed = nepodařilo se ani po opakování (hotové úkoly se mažou)
        status: {
            type: String,
            enum: ["pending", "processing", "failed"],
            default: "pending",
        },
        // Kolikrát se zpracování nezdařilo (podle toho se odvozuje pauza před dalším pokusem)
        attempts: {
            type: Number,
            default: 0,
            min: 0,
        },
        // Nejdřív, kdy se smí úkol spustit - po chybě odsune další pokus
        runAt: {
            type: Date,
            default: Date.now,
        },
        // Priorita zpracování - čerstvě požadované úkoly (modely, které si uživatel
        // právě prohlíží) mají vyšší hodnotu a předběhnou starší čekající požadavky
        priority: {
            type: Number,
            default: 0,
        },
        // Kdy úkol převzal zpracovatel - podle něj se pozná úkol uvízlý po pádu procesu
        processingStartedAt: {
            type: Date,
            default: null,
        },
        // Poslední chyba, aby bylo v databázi vidět, proč úkol neprošel
        lastError: {
            type: String,
            default: null,
        },
    },
    {
        collection: "generationjobs",
        timestamps: true,
    }
);

// Jeden model má ve frontě nejvýš jeden úkol daného typu - deduplikace platí
// i napříč instancemi serveru a po restartu (na rozdíl od Setu v paměti procesu)
generationJobSchema.index({ type: 1, modelId: 1 }, { unique: true });

// Podle stavu, priority a termínu se hledá další úkol ke zpracování
generationJobSchema.index({ status: 1, priority: -1, runAt: 1 });

module.exports = mongoose.model("GenerationJob", generationJobSchema);
