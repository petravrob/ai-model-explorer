/**
 * Hromadné předgenerování popisků a přehledů v češtině i angličtině
 * (npm run generate:content).
 *
 * Zařadí do fronty všechny modely, kterým chybí popisek aktuální verze v některém
 * jazyce nebo přehledy z dokumentace, spustí se a běží, dokud se fronta nevyprázdní.
 *
 * Volitelně lze omezit kontrolu jen na jeden jazyk:
 *   npm run generate:content -- --lang=en   (jen chybějící anglické texty)
 *   npm run generate:content -- --lang=cs   (jen chybějící české texty)
 *
 * Fronta je v databázi, takže skript lze kdykoli přerušit a spustit znovu.
 */

const mongoose = require("mongoose");

const connectDatabase = require("../config/database");
const { SUMMARY_ENABLED } = require("../config/env");
const AIModel = require("../models/AIModel");
const GenerationJob = require("../models/GenerationJob");
const { DESCRIPTION_VERSION } = require("../services/descriptionService");
const { enqueueJobs, startGenerationWorker } = require("../services/generationQueue");
const { PROMPT_VERSION } = require("../services/insightsService");

// Jak často skript hlásí, kolik úkolů ještě zbývá
const PROGRESS_INTERVAL_MS = 10000;

// Podporované hodnoty přepínače --lang
const LANGUAGES = new Set(["all", "cs", "en"]);

/** Jazyk z argumentu --lang (all = obě verze, cs/en = jen chybějící daná verze). */
function readLanguageArg() {
    const argument = process.argv.slice(2).find((value) => value.startsWith("--lang="));
    const value = argument ? argument.slice("--lang=".length).trim().toLowerCase() : "all";

    return LANGUAGES.has(value) ? value : "all";
}

/** Má model popisek aktuální verze v požadovaném jazyce (all = v obou)? */
function hasCurrentDescription(model, language) {
    const isCurrentVersion = model.description?.version === DESCRIPTION_VERSION;
    const czech = Boolean(model.description?.text?.trim());
    const english = Boolean(model.description?.textEn?.trim());

    if (language === "cs") {
        return isCurrentVersion && czech;
    }

    if (language === "en") {
        return isCurrentVersion && english;
    }

    return isCurrentVersion && czech && english;
}

/** Má model přehledy z aktuální dokumentace v požadovaném jazyce (all = v obou)? */
function hasCurrentInsights(model, language) {
    const isCurrent = (doc) => Boolean(doc?.sourceFingerprint && doc.promptVersion === PROMPT_VERSION);
    const czech = isCurrent(model.insights);
    const english = isCurrent(model.insightsEn);

    if (language === "cs") {
        return czech;
    }

    if (language === "en") {
        return english;
    }

    return czech && english;
}

/** Zařadí do fronty všechny modely bez aktuálního obsahu v požadovaném jazyce. */
async function enqueueMissingContent() {
    const language = readLanguageArg();

    const models = await AIModel.find(
        {},
        { modelId: 1, description: 1, insights: 1, insightsEn: 1 }
    ).lean();

    const missingDescriptions = models
        .filter((model) => !hasCurrentDescription(model, language))
        .map((model) => model.modelId);

    const missingInsights = models
        .filter((model) => !hasCurrentInsights(model, language))
        .map((model) => model.modelId);

    const enqueuedDescriptions = await enqueueJobs("description", missingDescriptions);
    const enqueuedInsights = await enqueueJobs("insights", missingInsights);

    const languageLabel = language === "all" ? "čeština i angličtina" : language;

    console.log(`V databázi je ${models.length} modelů (kontrolovaný jazyk: ${languageLabel}).`);
    console.log(`Do fronty zařazeno ${enqueuedDescriptions} popisků a ${enqueuedInsights} přehledů.`);
}

/** Počká, až fronta doběhne (úkoly odložené kvůli vyčerpanému limitu jsou ukončeny). */
async function waitUntilQueueDrains() {
    let cooldownHintShown = false;

    for (;;) {
        const remaining = await GenerationJob.countDocuments({ status: { $in: ["pending", "processing"] } });

        if (remaining === 0) {
            return;
        }

        // Úkoly odložené na později (typicky kvůli vyčerpanému dennímu limitu)
        // se nevyřídí - zbydou ve frontě pro server
        const nextReadyJob = await GenerationJob.findOne(
            { status: "pending" },
            { runAt: 1 },
            { sort: { runAt: 1 } }
        ).lean();

        if (nextReadyJob && nextReadyJob.runAt.getTime() > Date.now() + 60000) {
            if (!cooldownHintShown) {
                cooldownHintShown = true;
                console.log(
                    `\nZbývající úkoly (${remaining}) jsou odložené - nejspíš je vyčerpaný denní limit ` +
                    `poskytovatelů. Skript se ukončí, úkoly zůstávají ve frontě a zpracuje je server, ` +
                    `nebo skript spusťte znovu po obnovení limitu.`
                );
            }

            return;
        }

        console.log(`Zbývá úkolů: ${remaining}`);
        await new Promise((resolve) => setTimeout(resolve, PROGRESS_INTERVAL_MS));
    }
}

async function generateContent() {
    if (!SUMMARY_ENABLED) {
        console.error("Generování je vypnuté - chybí SUMMARY_API_KEY nebo GROQ_API_KEY v souboru .env.");
        process.exitCode = 1;

        return;
    }

    await connectDatabase();

    try {
        await enqueueMissingContent();

        startGenerationWorker();
        await waitUntilQueueDrains();

        const failed = await GenerationJob.countDocuments({ status: "failed" });

        if (failed > 0) {
            console.log(`\nHotovo, ale ${failed} úkolů se nepodařilo (chybu najdete v kolekci generationjobs).`);
        } else {
            console.log("\nHotovo, fronta je prázdná.");
        }
    } finally {
        await mongoose.connection.close();
        console.log("Spojení s databází bylo ukončeno.");
    }
}

generateContent().catch((error) => {
    console.error("Předgenerování obsahu selhalo:", error);
    process.exitCode = 1;
});
