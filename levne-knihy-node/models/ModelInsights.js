const mongoose = require("mongoose");

// České přehledy z dokumentace se ukládají zvlášť, aby se dokumentace nezpracovávala víckrát
const modelInsightsSchema = new mongoose.Schema(
    {
        modelId: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        // Zadání vstupu, ze kterého přehledy vznikly - při změně zadání nebo dokumentace se vytvoří znovu
        sourceTaskPrint: {
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
    },
    {
        collection: "modelInsights",
        timestamps: true,
    }
);

module.exports = mongoose.model("ModelInsights", modelInsightsSchema);
