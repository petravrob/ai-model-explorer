/**
 * Jazyk odpovědi API.
 *
 * `?lang=en` přepne obsah do angličtiny, cokoli jiného (nebo chybějící parametr)
 * znamená češtinu. U požadavků s tělem se bere i `lang` z těla.
 */
function readLanguage(req) {
    const value = req?.query?.lang ?? req?.body?.lang;

    return String(value ?? "").trim().toLowerCase().startsWith("en") ? "en" : "cs";
}

/** Texty chybových odpovědí API v obou jazycích. */
const MESSAGES = {
    cs: {
        modelsLoadFailed: "Nepodařilo se načíst modely.",
        modelLoadFailed: "Nepodařilo se načíst model.",
        modelNotFound: "Model nebyl nalezen.",
        unknownSort: "Neznámé řazení.",
        unknownTab: "Neznámý štítek.",
        missingModelId: "Chybí identifikátor modelu.",
        missingAuthor: "Chybí autor.",
        avatarLoadFailed: "Nepodařilo se načíst avatar.",
        descriptionsFailed: "Nepodařilo se vygenerovat popisky.",
        insightsFailed: "Nepodařilo se připravit přehledy z dokumentace.",
        cardLoadFailed: "Nepodařilo se načíst dokumentaci modelu.",
        notFound: "Adresa nebyla nalezena.",
        serverError: "Došlo k chybě serveru.",
    },
    en: {
        modelsLoadFailed: "Failed to load models.",
        modelLoadFailed: "Failed to load the model.",
        modelNotFound: "Model not found.",
        unknownSort: "Unknown sorting option.",
        unknownTab: "Unknown tab.",
        missingModelId: "The model identifier is missing.",
        missingAuthor: "The author is missing.",
        avatarLoadFailed: "Failed to load the avatar.",
        descriptionsFailed: "Failed to generate descriptions.",
        insightsFailed: "Failed to prepare the overviews from the documentation.",
        cardLoadFailed: "Failed to load the model documentation.",
        notFound: "The address was not found.",
        serverError: "A server error occurred.",
    },
};

/** Text chybové odpovědi v požadovaném jazyce (neznámý klíč zůstane jako klíč). */
function apiMessage(key, language = "cs") {
    return MESSAGES[language]?.[key] ?? MESSAGES.cs[key] ?? key;
}

module.exports = {
    readLanguage,
    apiMessage,
};
