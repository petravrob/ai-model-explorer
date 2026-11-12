/**
 * Doplní anglické překlady k existujícímu českému obsahu.
 *
 * Bere jen modely s hotovým českým popiskem/přehledy a doplní k nim angličtinu.
 * Generuje přímo (mimo frontu GenerationJob), protože databázi může sdílet
 * nasazený backend na starší verzi, který by úkoly z fronty spotřeboval bez uložení.
 *
 *   npm run prewarm:english -- --dry-run
 *   npm run prewarm:english -- --limit=500
 *
 * --limit=N omezí počet modelů od každého typu, --dry-run jen vypíše plán.
 */

const mongoose = require("mongoose");

const connectDatabase = require("../config/database");
const AIModel = require("../models/AIModel");
const { DESCRIPTION_VERSION, generateDescriptions } = require("../services/descriptionService");
const { PROMPT_VERSION, generateInsights } = require("../services/insightsService");

const BATCH_SIZE = 1;
const PAUSE_MS = 5000;

const args = Object.fromEntries(
    process.argv.slice(2).map((item) => item.replace(/^--/, "").split("="))
);
const limit = Number(args.limit) || Infinity;
const dryRun = "dry-run" in args;

const pause = () => new Promise((resolve) => setTimeout(resolve, PAUSE_MS));

/** Načte modely k překladu, nejpopulárnější první. */
async function loadCandidates() {
    const models = await AIModel.find(
        {},
        { modelId: 1, description: 1, insights: 1, insightsEn: 1 }
    ).sort({ downloads: -1 }).lean();

    const descriptions = models.filter((model) =>
        model.description?.version === DESCRIPTION_VERSION
        && model.description?.text?.trim()
        && !model.description?.textEn?.trim()
    );

    const insights = models.filter((model) =>
        model.insights?.promptVersion === PROMPT_VERSION
        && model.insights?.sourceFingerprint
        && (
            !model.insightsEn?.sourceFingerprint
            || model.insightsEn.sourceFingerprint !== model.insights.sourceFingerprint
        )
    );

    return {
        descriptions: descriptions.slice(0, limit),
        insights: insights.slice(0, limit),
    };
}

/** Uloží přeložený popisek. */
const saveDescription = ({ modelId, description, descriptionEn }) =>
    AIModel.updateOne(
        { modelId },
        {
            $set: {
                description: {
                    text: description,
                    textEn: descriptionEn,
                    version: DESCRIPTION_VERSION,
                    status: "ok",
                    generatedAt: new Date(),
                },
            },
        }
    );

/** Přeloží dávku popisků a uloží výsledky; když dávka selže, zkusí modely po jednom. */
async function translateDescriptions(batch) {
    const filter = {
        "description.version": DESCRIPTION_VERSION,
        "description.text": { $nin: [null, ""] },
        "description.textEn": { $in: [null, ""] },
    };
    const modelIds = batch.map((model) => model.modelId);

    const models = await AIModel.find(
        { modelId: { $in: modelIds }, ...filter },
        { modelId: 1, description: 1 }
    ).lean();

    if (models.length === 0) {
        return 0;
    }

    try {
        const results = await generateDescriptions(models);

        await Promise.all(results.map(saveDescription));

        // Když část dávky neprošla, zbytek se zkusí po jednom
        if (results.length === models.length) {
            return results.length;
        }
    } catch {
        // Dávka selhala (limit nebo nevalidní odpověď) - zkusí se po jednom
    }

    const remaining = await AIModel.find(
        { modelId: { $in: modelIds }, ...filter },
        { modelId: 1, description: 1 }
    ).lean();

    let done = 0;

    for (const model of remaining) {
        try {
            const results = await generateDescriptions([model]);

            await Promise.all(results.map(saveDescription));
            done += results.length;
        } catch {
            // Model se doplní při dalším spuštění
        }

        await pause();
    }

    if (done === 0 && remaining.length > 0) {
        throw new Error(`Nepodařilo se přeložit žádný z ${remaining.length} modelů v dávce.`);
    }

    return done;
}

/** Přeloží přehledy jednoho modelu (ukládání řeší insightsService). */
async function translateInsights([model]) {
    await generateInsights(model.modelId);

    return 1;
}

/**
 * Projde položky po dávkách a po dlouhé sérii chyb se zastaví.
 *
 * Padesát chyb v řadě při dávce 1 a minutové pauze znamená přibližně 50 minut
 * bez jediného úspěchu - to už je spolehlivý signál, že jsou kvóty vyčerpané.
 * Kratší limit (3-10) zastavoval běh i při přechodných 429, kdy se limit obnoví
 * během několika minut.
 */
async function processItems(items, worker, label, step) {
    let done = 0;
    let streak = 0;

    for (let index = 0; index < items.length; index += step) {
        try {
            done += await worker(items.slice(index, index + step));
            streak = 0;
        } catch (error) {
            streak += 1;
            console.error(`${label}: ${error.message.slice(0, 160)}`);

            if (streak >= 50) {
                console.error(`${label}: padesát chyb v řadě, končím.`);
                break;
            }
        }

        if (index % (step * 10) === 0) {
            console.log(`${label}: ${done} hotovo, zbývá ${Math.max(0, items.length - index - step)}.`);
        }

        // Po chybě se čeká déle, aby se stihl obnovit limit poskytovatele
        await new Promise((resolve) => setTimeout(resolve, streak > 0 ? 60000 : PAUSE_MS));
    }

    return done;
}

async function main() {
    await connectDatabase();

    try {
        const { descriptions, insights } = await loadCandidates();

        console.log(`K překladu: ${descriptions.length} popisků, ${insights.length} přehledů.`);

        if (descriptions.length === 0 && insights.length === 0) {
            console.log("Není co překládat - anglické texty už jsou hotové.");

            return;
        }

        if (dryRun) {
            console.log("První modely:", descriptions.slice(0, 8).map((model) => model.modelId).join(", "));
            console.log("Zkušební režim: nic se nevygenerovalo.");

            return;
        }

        const translatedDescriptions = await processItems(
            descriptions,
            translateDescriptions,
            "Popisky",
            BATCH_SIZE
        );
        const translatedInsights = await processItems(insights, translateInsights, "Přehledy", 1);

        console.log(`Hotovo: ${translatedDescriptions} popisků, ${translatedInsights} přehledů.`);
    } finally {
        await mongoose.connection.close();
    }
}

main().catch((error) => {
    console.error("Doplnění anglických překladů selhalo:", error);
    process.exitCode = 1;
});
