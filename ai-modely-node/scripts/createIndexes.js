/**
 * Vytvoří kolekce a indexy, které databáze potřebuje.
 *
 * Indexy jsou popsané i ve schématech, ale server má automatické vytváření
 * indexů vypnuté, aby se indexy nestavěly při každém startu. Tento skript
 * je vytvoří jednou, typicky hned po založení nové databáze.
 */

const mongoose = require("mongoose");

const connectDatabase = require("../config/database");
const AIModel = require("../models/AIModel");
const GenerationJob = require("../models/GenerationJob");

async function createIndexes() {
    await connectDatabase();

    try {
        // Počty se berou ze schématu, samotné vytvoření indexů obstará createIndexes()
        const modelIndexes = AIModel.schema.indexes();
        const jobIndexes = GenerationJob.schema.indexes();

        await AIModel.createIndexes();
        console.log(`Indexy kolekce models: ${modelIndexes.length}`);

        await GenerationJob.createIndexes();
        console.log(`Indexy kolekce generationjobs: ${jobIndexes.length}`);

        console.log("Indexy jsou hotové.");
    } finally {
        await mongoose.connection.close();
        console.log("\nSpojení s databází bylo ukončeno.");
    }
}

createIndexes().catch((error) => {
    console.error("Vytvoření indexů selhalo:", error);
    process.exitCode = 1;
});
