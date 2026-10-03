require("dotenv").config();

const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET;
const MONGO_URI = process.env.MONGO_URI;

// Volitelný token pro Hugging Face API (zvyšuje limity, bez něj stačí veřejná data)
const HUGGINGFACE_API_KEY = process.env.HUGGINGFACE_API_KEY || "";

// Poskytovatelé českých textů. Vyhovuje jakákoli služba s OpenAI kompatibilním
// rozhraním (Groq, Gemini, OpenRouter, Mistral, Ollama…). První se nastavuje přes
// SUMMARY_API_URL, SUMMARY_API_KEY a SUMMARY_MODEL, další se přidávají jako záložní
// (SUMMARY_API_URL_2, SUMMARY_API_KEY_2, SUMMARY_MODEL_2, …). Zkoušejí se popořadě,
// takže vyčerpaný limit u jednoho provoz nezastaví. Přijímá se i název GROQ_API_KEY.
const DEFAULT_API_URL = "https://api.groq.com/openai/v1";
const DEFAULT_MODEL = "openai/gpt-oss-120b";
const MAX_SUMMARY_PROVIDERS = 5;

/** Načte jednoho poskytovatele z prostředí (suffix je "" u prvního, jinak "_2", "_3"…). */
function readSummaryProvider(suffix, defaults = {}) {
    const url = (process.env[`SUMMARY_API_URL${suffix}`] || defaults.url || "").trim().replace(/\/+$/, "");
    const model = (process.env[`SUMMARY_MODEL${suffix}`] || defaults.model || "").trim();
    const key = (process.env[`SUMMARY_API_KEY${suffix}`] || defaults.key || "").trim();

    // Zkrácení přemýšlení u reasoning modelů (Groq zná "low", "medium", "high").
    // Nepovinné, protože jiní poskytovatelé tento parametr neznají.
    const reasoningEffort = (process.env[`SUMMARY_REASONING_EFFORT${suffix}`] || "").trim();

    // Prázdná položka se přeskočí, nedopsaná konfigurace je ale chyba.
    if (!url && !model && !key) {
        return null;
    }

    if (!url || !model) {
        throw new Error(`Nedopsaný poskytovatel textů: doplňte SUMMARY_API_URL${suffix} i SUMMARY_MODEL${suffix}.`);
    }

    return { url, model, key, reasoningEffort };
}

const SUMMARY_PROVIDERS = [];
const hasOwnSummarySettings = Boolean(
    process.env.SUMMARY_API_URL || process.env.SUMMARY_MODEL || process.env.SUMMARY_API_KEY || process.env.GROQ_API_KEY
);

for (let index = 1; index <= MAX_SUMMARY_PROVIDERS; index++) {
    const suffix = index === 1 ? "" : `_${index}`;
    const defaults = index === 1 && hasOwnSummarySettings
        ? { url: DEFAULT_API_URL, model: DEFAULT_MODEL, key: process.env.GROQ_API_KEY || "" }
        : {};

    const provider = readSummaryProvider(suffix, defaults);

    if (provider) {
        SUMMARY_PROVIDERS.push(provider);
    }
}

/** Doména poskytovatele (kvůli dědění klíče u stejné služby). */
function hostOf(url) {
    try {
        return new URL(url).host;
    } catch {
        return "";
    }
}

// Klíč se dědí z prvního poskytovatele, ale jen když jde o stejnou službu. Dva modely
// u jednoho poskytovatele tak vystačí s jedním klíčem, cizí služba ho ale nedostane.
const firstProvider = SUMMARY_PROVIDERS[0];

if (firstProvider?.key) {
    for (const provider of SUMMARY_PROVIDERS) {
        if (!provider.key && hostOf(provider.url) === hostOf(firstProvider.url)) {
            provider.key = firstProvider.key;
        }
    }
}

// Generování je zapnuté, když je nastavený aspoň jeden poskytovatel (Ollama klíč nepotřebuje).
const SUMMARY_ENABLED = SUMMARY_PROVIDERS.length > 0;

// Hodnoty prvního poskytovatele zůstávají kvůli zpětné kompatibilitě.
const SUMMARY_API_KEY = SUMMARY_PROVIDERS[0]?.key || "";
const SUMMARY_API_URL = SUMMARY_PROVIDERS[0]?.url || DEFAULT_API_URL;
const SUMMARY_MODEL = SUMMARY_PROVIDERS[0]?.model || DEFAULT_MODEL;
const SUMMARY_REASONING_EFFORT = SUMMARY_PROVIDERS[0]?.reasoningEffort || "";

if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined.");
}

if (!MONGO_URI) {
    throw new Error("MONGO_URI is not defined.");
}

module.exports = {
    PORT,
    JWT_SECRET,
    MONGO_URI,
    HUGGINGFACE_API_KEY,
    SUMMARY_PROVIDERS,
    SUMMARY_ENABLED,
    SUMMARY_API_KEY,
    SUMMARY_API_URL,
    SUMMARY_MODEL,
    SUMMARY_REASONING_EFFORT,
};
