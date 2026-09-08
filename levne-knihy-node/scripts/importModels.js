const mongoose = require("mongoose");

const connectDatabase = require("../config/database");
const AIModel = require("../models/AIModel");
const {
    DEFAULT_TASKS,
    getModel,
    getModels,
} = require("../services/huggingFaceService");

/** Načte hodnoty volitelného opakovatelného argumentu (např. „--task=text-to-image“). */
function getArgValues(name) {
    return process.argv
        .slice(2)
        .filter((arg) => arg.startsWith(`--${name}=`))
        .map((arg) => arg.slice(name.length + 3));
}

/** Načte modely podle argumentů skriptu (konkrétní id, jinak top modely úloh). */
async function collectModels(tasks, limitPerTask, singleIds) {
    if (singleIds.length > 0) {
        const models = [];

        for (const modelId of singleIds) {
            try {
                models.push(await getModel(modelId));
            } catch (error) {
                console.error(`Model „${modelId}“ se nepodařilo načíst: ${error.message}`);
            }
        }

        return models;
    }

    return getModels({
        tasks: tasks.length > 0 ? tasks : DEFAULT_TASKS,
        limitPerTask,
    });
}

/** Importuje modely z Hugging Face a uloží je do databáze (existující jen aktualizuje). */
async function importModels() {
    const tasks = getArgValues("task");

    const perTaskArg = Number(getArgValues("per-task")[0]);
    const limitPerTask = Number.isFinite(perTaskArg) && perTaskArg > 0 ? perTaskArg : undefined;

    const singleIds = getArgValues("id");

    await connectDatabase();

    try {
        const models = await collectModels(tasks, limitPerTask, singleIds);

        console.log(`Hugging Face vrátilo ${models.length} modelů.\n`);

        let createdCount = 0;
        let updatedCount = 0;

        for (const [index, model] of models.entries()) {
            const result = await AIModel.updateOne(
                { modelId: model.modelId },
                { $set: model },
                { upsert: true }
            );

            if (result.upsertedCount > 0) {
                createdCount++;
            } else {
                updatedCount++;
            }

            console.log(`[${index + 1}/${models.length}] ${model.modelId}`);
        }

        console.log("");
        console.log(`Import hotový. Nové modely: ${createdCount}, aktualizované modely: ${updatedCount}.`);
    } finally {
        await mongoose.connection.close();
        console.log("\nSpojení s databází bylo ukončeno.");
    }
}

importModels().catch((error) => {
    console.error("Import modelů selhal:", error);
    process.exitCode = 1;
});
