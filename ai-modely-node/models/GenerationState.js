const mongoose = require("mongoose");

// Počítadlo denního rozpočtu hromadného doplňování obsahu.
// Jeden dokument na den (klíč "bulkDaily" + datum), _id je složený řetězec,
// takže upsert funguje atomicky bez nutnosti dalšího indexu.
const generationStateSchema = new mongoose.Schema(
    {
        // Složený klíč ve tvaru "bulkDaily:2026-11-12" - jedinečný pro každý den
        _id: {
            type: String,
            required: true,
        },
        key: {
            type: String,
            required: true,
            trim: true,
        },
        // Datum, ke kterému se počítadlo vztahuje (YYYY-MM-DD v čase serveru)
        date: {
            type: String,
            required: true,
            trim: true,
        },
        count: {
            type: Number,
            default: 0,
            min: 0,
        },
    },
    {
        collection: "generationstate",
        timestamps: true,
    }
);

module.exports = mongoose.model("GenerationState", generationStateSchema);