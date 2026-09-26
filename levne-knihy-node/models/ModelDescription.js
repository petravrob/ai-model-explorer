const mongoose = require("mongoose");

// Vygenerované české popisy se ukládají zvlášť, aby se nemusely ukládat k modelům načteným z Hugging Face
const modelDescriptionSchema = new mongoose.Schema(
    {
        modelId: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        description: {
            type: String,
            required: true,
            trim: true,
        },
    },
    {
        collection: "modelDescriptions",
        timestamps: true,
    }
);

module.exports = mongoose.model("ModelDescription", modelDescriptionSchema);
