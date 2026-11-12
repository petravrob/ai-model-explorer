/**
 * Doplňování chybějícího obsahu (popisky a přehledy) do fronty generování.
 *
 * Sdílená logika pro skript npm run generate:content i pro denní plánovač
 * (services/contentScheduler.js). Projde všechny modely v databázi, najde ty
 * bez aktuálního popisku/přehledů v požadovaném jazyce a zařadí je do fronty.
 * Samotné generování řeší zpracovatel fronty na pozadí.
 */

const AIModel = require("../models/AIModel");
const { DESCRIPTION_VERSION } = require("./descriptionService");
const { enqueueJobs } = require("./generationQueue");
const { PROMPT_VERSION } = require("./insightsService");

// Podporované jazyky pro kontrolu (all = obě verze)
const LANGUAGES = new Set(["all", "cs", "en"]);

/** Převede vstup na platný jazyk kontroly (all/cs/en). */
function normalizeLanguage(value) {
    const language = String(value ?? "all").trim().toLowerCase();

    return LANGUAGES.has(language) ? language : "all";
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

/**
 * Zařadí do fronty všechny modely bez aktuálního obsahu v požadovaném jazyce.
 * Vrací počty pro logování: celkový počet modelů a kolik popisků/přehledů se zařadilo.
 */
async function enqueueMissingContent(language = "all") {
    const resolvedLanguage = normalizeLanguage(language);

    const models = await AIModel.find(
        {},
        { modelId: 1, description: 1, insights: 1, insightsEn: 1 }
    ).lean();

    const missingDescriptions = models
        .filter((model) => !hasCurrentDescription(model, resolvedLanguage))
        .map((model) => model.modelId);

    const missingInsights = models
        .filter((model) => !hasCurrentInsights(model, resolvedLanguage))
        .map((model) => model.modelId);

    const enqueuedDescriptions = await enqueueJobs("description", missingDescriptions, { bulk: true });
    const enqueuedInsights = await enqueueJobs("insights", missingInsights, { bulk: true });

    return {
        totalModels: models.length,
        enqueuedDescriptions,
        enqueuedInsights,
        language: resolvedLanguage,
    };
}

module.exports = {
    enqueueMissingContent,
    normalizeLanguage,
};