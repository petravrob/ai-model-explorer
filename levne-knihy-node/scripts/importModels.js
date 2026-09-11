const mongoose = require("mongoose");

const connectDatabase = require("../config/database");
const AIModel = require("../models/AIModel");
const { DEFAULT_TASKS, getAuthorPageHtml, getModel, getModels } = require("../services/huggingFaceService");
const { isValidModel, mapModelData } = require("../services/modelMapper");

/** Načte hodnoty volitelného opakovatelného argumentu (např. „--task=text-to-image“). */
function getArgValues(name) {
    return process.argv
        .slice(2)
        .filter((arg) => arg.startsWith(`--${name}=`))
        .map((arg) => arg.slice(name.length + 3));
}

/** Vyhledá adresu avataru autora v HTML jeho stránky (v datech authorData). */
function extractAvatarUrl(html, author) {

    // Data jsou v HTML escapovaná (&quot; místo uvozovek), nejdřív je dekódujeme
    const decoded = html
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&amp;/g, '&');

    const authorDataPattern = /"authorData":\{[^{}]*\}/g;

    for (const match of decoded.matchAll(authorDataPattern)) {

        if (!match[0].includes(`"name":"${author}"`)) {
            continue;
        }

        const avatarMatch = match[0].match(/"avatarUrl":"([^"]+)"/);

        if (avatarMatch) {
            const avatarUrl = avatarMatch[1];

            // Relativní adresy doplníme o doménu Hugging Face
            return avatarUrl.startsWith("http")
                ? avatarUrl
                : `https://huggingface.co${avatarUrl}`;
        }
    }

    return null;
}

/** Načte avatary pro všechny autory (jeden autor se načítá jen jednou). */
async function collectAuthorAvatars(authors) {
    const avatars = new Map();

    for (const [index, author] of authors.entries()) {
        try {
            const html = await getAuthorPageHtml(author);

            avatars.set(author, extractAvatarUrl(html, author));
        } catch (error) {
            console.error(`Avatar autora „${author}“ se nepodařilo načíst: ${error.message}`);

            avatars.set(author, null);
        }

        console.log(`[${index + 1}/${authors.length}] ${author}: ${avatars.get(author) ? "ok" : "bez avataru"}`);

        // Krátká pauza, abychom Hugging Face nezatěžovali příliš rychle
        await new Promise((resolve) => setTimeout(resolve, 200));
    }

    return avatars;
}

/** Sestaví seznam modelů k uložení podle argumentů skriptu (konkrétní id, jinak top modely úloh). */
async function collectModels(tasks, limitPerTask, singleIds) {
    const rawModels = [];

    if (singleIds.length > 0) {
        for (const modelId of singleIds) {
            try {
                rawModels.push(await getModel(modelId));
            } catch (error) {
                console.error(`Model „${modelId}“ se nepodařilo načíst: ${error.message}`);
            }
        }
    } else {
        rawModels.push(...await getModels({
            tasks: tasks.length > 0 ? tasks : DEFAULT_TASKS,
            limitPerTask,
        }));
    }

    // Převede a zvaliduje surová data, duplicity a neúplné modely přeskočí
    const models = [];
    const seenModelIds = new Set();

    for (const rawModel of rawModels) {
        const model = mapModelData(rawModel);

        if (!isValidModel(model) || seenModelIds.has(model.modelId)) {
            continue;
        }

        seenModelIds.add(model.modelId);
        models.push(model);
    }

    return models;
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

        console.log(`K uložení je připraveno ${models.length} modelů.\n`);

        // Načte avatar autora pro každý model (jeden autor se řeší jen jednou)
        const authors = [...new Set(models.map((model) => model.author))];

        console.log(`Načítání avatarů pro ${authors.length} autorů...\n`);

        const avatars = await collectAuthorAvatars(authors);

        let withAvatarCount = 0;

        for (const model of models) {
            model.avatarUrl = avatars.get(model.author) ?? null;

            if (model.avatarUrl) {
                withAvatarCount++;
            }
        }

        console.log(`\nAvatary nalezeny pro ${withAvatarCount} z ${models.length} modelů.\n`);

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
