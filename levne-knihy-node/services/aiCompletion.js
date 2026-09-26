/**
 * Volání AI pro generování českých textů.
 *
 * Funguje s OpenAI kompatibilním rozhraním (Groq, Mistral, Ollama…). 
 * Používané pro generování popisků i přehledů z dokumentace.
 */

const { SUMMARY_API_KEY, SUMMARY_API_URL, SUMMARY_MODEL, SUMMARY_REASONING_EFFORT } = require("../config/env");

const REQUEST_TIMEOUT_MS = 60000;
const MAX_ATTEMPTS = 3;
const RETRY_DELAY_MS = 5000;

/** Zavolá poskytovatele a vrátí jeho odpověď (při omezení rychlosti to zkusí znovu). */
async function requestCompletion({ system, prompt, temperature = 0.8, maxTokens = 1000 }) {
    if (!SUMMARY_API_KEY) {
        throw new Error("Chybí SUMMARY_API_KEY nebo GROQ_API_KEY v souboru levne-knihy-node/.env.");
    }

    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
        const response = await fetch(`${SUMMARY_API_URL}/chat/completions`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${SUMMARY_API_KEY}`,
            },
            body: JSON.stringify({
                model: SUMMARY_MODEL,
                // reasoning modely potřebují omezení
                ...(SUMMARY_REASONING_EFFORT ? { reasoning_effort: SUMMARY_REASONING_EFFORT } : {}),
                temperature,
                max_tokens: maxTokens,
                messages: [
                    { role: "system", content: system },
                    { role: "user", content: prompt },
                ],
            }),
            signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
        });

        // Služba omezuje počet požadavků, proto se to po chvíli zkusí znovu.
        // Vyčerpaný denní limit ale opakovat nemá smysl – obnoví se až další den.
        if (response.status === 429) {
            const detail = await response.text();

            if (/per day|daily/i.test(detail)) {
                throw new Error(`Poskytovatel textů má vyčerpaný denní limit: ${detail.slice(0, 200)}`);
            }

            if (attempt < MAX_ATTEMPTS) {
                await new Promise((resolve) => setTimeout(resolve, attempt * RETRY_DELAY_MS));

                continue;
            }

            throw new Error(`Poskytovatel textů vrátil chybu 429: ${detail.slice(0, 200)}`);
        }

        if (!response.ok) {
            const detail = await response.text();

            // Chyba 404 obvykle znamená název modelu, který u dané služby neexistuje
            const hint = response.status === 404
                ? " Zkontrolujte SUMMARY_MODEL v .env, musí to být model dostupný u zvoleného poskytovatele."
                : "";

            throw new Error(`Poskytovatel textů vrátil chybu ${response.status}: ${detail.slice(0, 200)}${hint}`);
        }

        return response.json();
    }

    throw new Error("Text se nepodařilo vygenerovat.");
}

module.exports = {
    requestCompletion,
};
