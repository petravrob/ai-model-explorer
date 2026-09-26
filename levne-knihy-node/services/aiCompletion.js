/**
 * Volání AI pro generování českých textů.
 *
 * Funguje s OpenAI kompatibilním rozhraním (Groq, Mistral, Ollama…). 
 * Používané pro generování popisků i přehledů z dokumentace.
 */

const { SUMMARY_PROVIDERS } = require("../config/env");

const REQUEST_TIMEOUT_MS = 60000;
const MAX_ATTEMPTS = 3;
const RETRY_DELAY_MS = 5000;

/** Chyba u jednoho poskytovatele. "retryable" říká, zda má smysl zkoušet ho znovu. */
function providerError(message, retryable) {
    const error = new Error(message);
    error.retryable = retryable;

    return error;
}

/** Krátké označení poskytovatele do chybové zprávy (např. api.groq.com). */
function labelOf(provider, index) {
    try {
        return `${new URL(provider.url).host} (${provider.model})`;
    } catch {
        return `poskytovatel ${index + 1} (${provider.model})`;
    }
}

/**
 * Vyčerpaný limit (denní) se do dalšího období sám neobnoví, takže opakovat
 * požadavek nemá smysl - přeskočí se na dalšího poskytovatele.
 */
function isQuotaError(detail) {
    return /per day|daily|quota|resource_exhausted|exceeded your current/i.test(detail);
}

/** Převede chybu volání na text do hlášení. */
function describeFailure(error) {
    if (error.name === "TimeoutError" || error.name === "AbortError") {
        return `neodpověděl včas (${Math.round(REQUEST_TIMEOUT_MS / 1000)} s)`;
    }

    // Chyby ze sítě nemají příznak, chyby od poskytovatele ano
    if (error.retryable === undefined) {
        return `se nepodařilo připojit: ${error.message}`;
    }

    return error.message;
}

/** Chyba 404 obvykle znamená název modelu, který u dané služby neexistuje. */
function hintFor(status) {
    return status === 404
        ? " Zkontrolujte SUMMARY_MODEL v .env, musí to být model dostupný u zvoleného poskytovatele."
        : "";
}

/** Zavolá jednoho poskytovatele a vrátí jeho odpověď. */
async function callProvider(provider, { system, prompt, temperature, maxTokens }) {
    const response = await fetch(`${provider.url}/chat/completions`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${provider.key}`,
        },
        body: JSON.stringify({
            model: provider.model,
            // reasoning modely potřebují omezení
            ...(provider.reasoningEffort ? { reasoning_effort: provider.reasoningEffort } : {}),
            temperature,
            max_tokens: maxTokens,
            messages: [
                { role: "system", content: system },
                { role: "user", content: prompt },
            ],
        }),
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });

    if (response.ok) {
        return response.json();
    }

    const detail = (await response.text()).slice(0, 200);

    // 429 znamená buď omezení rychlosti, nebo vyčerpaný limit
    if (response.status === 429) {
        if (isQuotaError(detail)) {
            throw providerError(`má vyčerpaný limit: ${detail}`, false);
        }

        throw providerError(`omezuje počet požadavků (429): ${detail}`, true);
    }

    // Přechodné chyby poskytovatele se zkoušejí znovu, chyby v nastavení ne
    if (response.status >= 500 || response.status === 408) {
        throw providerError(`vrátil chybu ${response.status}: ${detail}`, true);
    }

    throw providerError(`vrátil chybu ${response.status}: ${detail}${hintFor(response.status)}`, false);
}

/**
 * Zavolá poskytovatele českých textů a vrátí odpověď.
 *
 * Poskytovatelé z .env se zkoušejí popořadě (SUMMARY_API_URL, SUMMARY_API_URL_2, …).
 * U přechodných chyb se požadavek opakuje, u vyčerpaného limitu nebo chyby
 * v nastavení se hned přechází na dalšího poskytovatele.
 */
async function requestCompletion({ system, prompt, temperature = 0.8, maxTokens = 1000 }) {
    if (SUMMARY_PROVIDERS.length === 0) {
        throw new Error("Chybí SUMMARY_API_KEY nebo GROQ_API_KEY v souboru levne-knihy-node/.env.");
    }

    // Aby se v hlášení neopakoval stejný poskytovatel víckrát, drží se jen poslední chyba.
    const problems = new Map();

    for (const [index, provider] of SUMMARY_PROVIDERS.entries()) {
        const label = labelOf(provider, index);

        for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
            try {
                return await callProvider(provider, { system, prompt, temperature, maxTokens });
            } catch (error) {
                problems.set(label, describeFailure(error));

                // Vyčerpaný limit i chyba v nastavení znamenají, že opakování nemá smysl
                if (error.retryable === false || attempt === MAX_ATTEMPTS) {
                    break;
                }

                await new Promise((resolve) => setTimeout(resolve, attempt * RETRY_DELAY_MS));
            }
        }
    }

    const details = [...problems].map(([label, message]) => `${label} ${message}`).join(" | ");

    throw new Error(`Text se nepodařilo vygenerovat. ${details}`);
}

module.exports = {
    requestCompletion,
};
