/**
 * Vygeneruje české AI popisy modelů a uloží je do databáze.
 *
 * npm run generate:descriptions                 # jen modely bez popisů
 * npm run generate:descriptions -- --live       # doplní i modely z živých výpisů
 * npm run generate:descriptions -- --limit=5    # jen prvních pět modelů
 * npm run generate:descriptions -- --model=meta-llama/Llama-3.1-8B-Instruct
 * npm run generate:descriptions -- --force      # přepíše i hotové popisy
 * npm run generate:descriptions -- --dry-run    # vygeneruje, ale neuloží
 *
 * Hotové AI popisy se ukládají průběžně, přerušený běh se dá spustit znovu.
 */

const mongoose = require("mongoose");
const { resolve } = require("path");

const connectDatabase = require("../config/database");
const { SUMMARY_API_KEY } = require("../config/env");
const AIModel = require("../models/AIModel");
const { generateDescription } = require("../services/descriptionService");
const { SORT_PARAMS, getModels, getSortedModels } = require("../services/huggingFaceService");
const { mapRawModels } = require("../services/modelMapper");

// Poskytovatelé mají limit kolem 30 požadavků za minutu, proto se mezi voláními čeká
const PAUSE_BETWEEN_REQUESTS_MS = 2200;

// Kolik chyb v řadě běh ukončí (obvykle to znamená vyčerpaný denní limit)
const MAX_CONSECUTIVE_ERRORS = 3;

/** Načte hodnoty opakovatelného argumentu (např. --model=…). */
function getArgValues(name) {
    return process.argv
        .slice(2)
        .filter((arg) => arg.startsWith(`--${name}=`))
        .map((arg) => arg.slice(name.length + 3));
}

/** Uloží do databáze modely z živých výpisů (v aplikaci se zobrazují právě ony). */
async function saveModelsFromLiveLists() {
    const rawLists = [await getModels()];

    for (const sort of Object.keys(SORT_PARAMS)) {
        rawLists.push(await getSortedModels(sort));
    }

    const models = mapRawModels(rawLists.flat().filter(Boolean));

    for (const model of models) {
        // Ukládá se celý model kromě AI generovaného popisu, aby se hotové AI generované popisy nepřepisovaly
        await AIModel.updateOne({ modelId: model.modelId }, { $set: model }, { upsert: true });
    }
}

async function main() {
    const dryRun = process.argv.includes("--dry-run");
    const force = process.argv.includes("--force");
    const live = process.argv.includes("--live");

    const limitArg = Number(getArgValues("limit")[0]);
    const limit = Number.isFinite(limitArg) && limitArg > 0 ? limitArg : null;
    const singleIds = getArgValues("model");

    // Bez klíče nemá smysl se připojovat k databázi ani nic posílat
    if (!SUMMARY_API_KEY) {
        console.error(`Chybí SUMMARY_API_KEY (nebo GROQ_API_KEY) v souboru ${resolve(__dirname, "..", ".env")}.`);
        console.error("Klíč zdarma získáte na https://console.groq.com/keys a vložíte ho do řádku SUMMARY_API_KEY=gsk_...");

        return;
    }

    await connectDatabase();

    try {
        if (live) {
            await saveModelsFromLiveLists();
        }

        // S přepínačem --model se vyberou konkrétní modely, --force přepíše i hotové AI generované popisy
        const query = singleIds.length > 0
            ? { modelId: { $in: singleIds } }
            : (force ? {} : { description: null });

        const modelQuery = AIModel.find(query).sort({ downloads: -1 });

        if (limit) {
            modelQuery.limit(limit);
        }

        const models = await modelQuery;

        let createdCount = 0;
        let failedCount = 0;
        let tokenCount = 0;
        let consecutiveErrors = 0;

        for (const [index, model] of models.entries()) {
            const position = `[${index + 1}/${models.length}] ${model.modelId}`;

            try {
                const result = await generateDescription(model);

                if (!dryRun) {
                    await AIModel.updateOne({ modelId: model.modelId }, { $set: { description: result.description } });
                }

                createdCount++;
                tokenCount += result.tokens;
                consecutiveErrors = 0;

                console.log(position);
                console.log(`    ${result.description}`);
            } catch (error) {
                failedCount++;
                consecutiveErrors++;

                console.error(`${position} chyba: ${error.message}`);

                if (consecutiveErrors >= MAX_CONSECUTIVE_ERRORS) {
                    console.error(`\nUkončuji po ${MAX_CONSECUTIVE_ERRORS} chybách v řadě, viz chyby výše.`);

                    break;
                }
            }

            if (index < models.length - 1) {
                await new Promise((resolve) => setTimeout(resolve, PAUSE_BETWEEN_REQUESTS_MS));
            }
        }

        console.log(`AI popisy vytvořeny. Zpracované popisy: ${createdCount}, chyby: ${failedCount}, spotřebované tokeny: ${tokenCount}.`);

        if (dryRun) {
            console.log("Nic se neukládalo (--dry-run).");
        }
    } finally {
        await mongoose.connection.close();

        console.log("Spojení s databází bylo ukončeno.");
    }
}

main().catch((error) => {
    console.error("Generování AI popisů selhalo:", error);

    process.exitCode = 1;
});
