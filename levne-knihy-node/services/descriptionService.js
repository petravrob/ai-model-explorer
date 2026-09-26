/**
 * Generování krátkých českých popisků AI modelů.
 *
 * AI generovaný popisek má uživateli rychle zdělit, co je na modelu zajímavé a k čemu se hodí.
 * Generuje se skriptem scripts/generateDescriptions.js a ukládá se do databáze.
 */

const { SUMMARY_API_KEY, SUMMARY_API_URL, SUMMARY_MODEL, SUMMARY_REASONING_EFFORT } = require("../config/env");

// Delší text se do karty nevejde, proto se ořezává
const MAX_DESCRIPTION_LENGTH = 300;

const REQUEST_TIMEOUT_MS = 45000;
const MAX_ATTEMPTS = 3;
const RETRY_DELAY_MS = 5000;

// Jak se má model chovat (píše popisek pro kartu, nic si nevymýšlí)
const SYSTEM_PROMPT = [
    "Jsi editor českého katalogu AI modelů.",
    "Píšeš krátké, přirozené a konkrétní popisky AI modelů.",
    "Čtenář už na kartě vidí název modelu, autora, štítky a základní statistiky.",
    "Popis proto nemá tyto informace pouze mechanicky opakovat.",
    "Jeho hlavním účelem je říct něco zajímavého a užitečného právě o tomto konkrétním modelu.",
    "Vysvětli především, co model dělá, k čemu se hodí nebo čím je jeho použití zajímavé.",
    "Pokud jsou dostupné informace o specializaci, architektuře, modalitě, programování, obrazech,",
    "zvuku, jazycích nebo lokálním použití, využij je přirozeně v textu.",
    "Parametry, počet jazyků, licenci nebo knihovnu zmiňuj pouze tehdy, pokud jsou pro daný model zajímavým detailem.",
    "Nevytvářej obecné marketingové fráze a nepoužívej výrazy jako „výkonný“, „všestranný“,",
    "„moderní“, „pokročilý“ nebo „ideální pro mnoho úloh“, pokud nejsou podložené konkrétní informací.",
    "Nevymýšlej schopnosti, benchmarky, kvalitu, rychlost ani použití, které nejsou v dodaných datech.",
    "Piš přirozenou spisovnou češtinou.",
].join(" ");

// Ukázky tónu (nejde o šablony, jen o příklady stylistiky vět)
const STYLE_EXAMPLES = [
    "Model převádí mluvenou řeč do textu a zvládá více jazyků, takže se hodí například pro automatický přepis nahrávek.",
    "Zaměřuje se na generování obrázků z textového zadání a podporuje také úpravy existujících obrazů.",
    "Menší jazykový model orientovaný na programování, který může být zajímavou volbou pro lokální práci s kódem.",
    "Kombinuje textové a obrazové vstupy, takže dokáže pracovat s informacemi z obou modalit v jednom zadání.",
];

// Technické štítky, které běžnému návštěvníkovi katalogu nic neřeknou
const NOISE_TAGS = new Set([
    "transformers",
    "safetensors",
    "pytorch",
    "tensorflow",
    "flax",
    "jax",
    "endpoints_compatible",
    "text-generation-inference",
    "autotrain_compatible",
    "custom_code",
    "arxiv",
    "has_space",
]);

/** Vybere štítky, které můžou něco říct o schopnostech modelu. */
function selectMeaningfulTags(tags = []) {
    return (tags ?? [])
        .filter((tag) => typeof tag === "string")
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0 && !tag.includes(":") && !NOISE_TAGS.has(tag.toLowerCase()))
        .slice(0, 15);
}

/** Zformátuje počet parametrů do čitelné české podoby (např. 8,03 mld.). */
function formatParameters(parameters) {
    return new Intl.NumberFormat("cs-CZ", {
        notation: "compact",
        maximumFractionDigits: 1,
    }).format(parameters);
}

/** Sestaví zadání pro model z údajů, které o modelu víme. */
function buildPrompt(model) {
    const tags = selectMeaningfulTags(model.tags);

    const facts = [
        model.modelId ? `Identifikátor modelu: ${model.modelId}` : null,
        model.author ? `Autor: ${model.author}` : null,
        model.task ? `Hlavní úloha: ${model.task}` : null,
        model.library ? `Knihovna: ${model.library}` : null,
        model.license ? `Licence: ${model.license}` : null,
        model.parameters ? `Velikost: ${formatParameters(model.parameters)} parametrů` : null,
        model.languages?.length ? `Jazyky: ${model.languages.join(", ")}` : null,
        tags.length > 0 ? `Významné štítky: ${tags.join(", ")}` : null,
    ].filter(Boolean);

    return [
        "Napiš krátkou anotaci tohoto AI modelu pro kartu v českém katalogu.",
        "",
        "POŽADAVKY:",
        "- přibližně 180–280 znaků",
        "- přirozená a spisovná čeština",
        "- text musí být konkrétní pro tento model",
        "- první věta má vysvětlit jeho hlavní schopnost nebo zaměření",
        "- druhá věta má přidat zajímavý konkrétní detail nebo praktické využití",
        "- informace vybírej podle toho, co je pro tento model skutečně zajímavé",
        "- parametry, jazyky, licenci nebo knihovnu nepoužívej jen proto, že jsou dostupné",
        "- pokud je model něčím specializovaný, dej přednost této informaci před obecnými statistikami",
        "- pokud jsou dostupné informace o programování, obrazech, zvuku, multimodalitě, reasoning,",
        "  lokálním použití nebo jiné konkrétní schopnosti, využij je",
        "- název modelu ani autora neopakuj",
        "- nezačínej větou „Tento model...“",
        "- nepoužívej odrážky",
        "- nevymýšlej žádné informace",
        "",
        "PŘÍKLADY POŽADOVANÉHO STYLU:",
        ...STYLE_EXAMPLES.map((example) => `- ${example}`),
        "",
        "DOSTUPNÁ DATA O MODELU:",
        ...facts,
    ].join("\n");
}

/** Vyčistí odpověď AI tak, aby se dala vložit do karty. */
function cleanSummary(text) {
    const cleaned = String(text ?? "")
        .replace(/^\s*(?:popis|description|popisy)\s*:\s*/i, "")
        .replace(/^\*\*(.*?)\*\*$/, "$1")
        .replace(/^[-*•]\s*/, "")
        .replace(/^[„“"'›»]+|[„“"'‹«]+$/g, "")
        .replace(/[\r\n]+/g, " ")
        .replace(/\s{2,}/g, " ")
        .trim();

    if (cleaned.length <= MAX_DESCRIPTION_LENGTH) {
        return cleaned;
    }

    // Delší text se zkrátí na poslední celé slovo
    return `${cleaned.slice(0, MAX_DESCRIPTION_LENGTH).replace(/\s+\S*$/, "").trim()}…`;
}

/** Zavolá OpenAI (Groq). */
async function requestCompletion(prompt) {
    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
        const response = await fetch(`${SUMMARY_API_URL}/chat/completions`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${SUMMARY_API_KEY}`,
            },
            body: JSON.stringify({
                model: SUMMARY_MODEL,
                // Reasoning modely (např. gpt-oss) potřebují rozpočet i na přemýšlení;
                // s kratším přemýšlením zbyde dost tokenů i na samotný popisek
                ...(SUMMARY_REASONING_EFFORT ? { reasoning_effort: SUMMARY_REASONING_EFFORT } : {}),
                // Vyšší temperature omezuje stereotypní formulace
                temperature: 0.8,
                max_tokens: 1000,
                messages: [
                    { role: "system", content: SYSTEM_PROMPT },
                    { role: "user", content: prompt },
                ],
            }),
            signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
        });

        // Poskytovatel omezuje počet požadavků, proto se to po chvíli zkusí znovu
        if (response.status === 429 && attempt < MAX_ATTEMPTS) {
            await new Promise((resolve) => setTimeout(resolve, attempt * RETRY_DELAY_MS));

            continue;
        }

        if (!response.ok) {
            const detail = await response.text();

            // Chyba 404 obvykle znamená název modelu, který u daného poskytovatele neexistuje
            const hint = response.status === 404
                ? " Zkontrolujte SUMMARY_MODEL v .env, musí to být model dostupný u zvoleného poskytovatele."
                : "";

            throw new Error(`Poskytovatel popisů vrátil chybu ${response.status}: ${detail.slice(0, 200)}${hint}`);
        }

        return response.json();
    }

    throw new Error("Popisek se nepodařilo vygenerovat.");
}

/** Vygeneruje českou anotaci jednoho modelu (vrací i počet spotřebovaných tokenů). */
async function generateDescription(model) {
    if (!SUMMARY_API_KEY) {
        throw new Error("Chybí SUMMARY_API_KEY (nebo GROQ_API_KEY) v souboru levne-knihy-node/.env.");
    }

    const data = await requestCompletion(buildPrompt(model));
    const description = cleanSummary(data?.choices?.[0]?.message?.content);

    if (description.length < 40) {
        // V chybě je i náhled odpovědi, aby bylo vidět, co poskytovatel skutečně vrátil
        throw new Error(`Model vrátil příliš krátký popisek: „${description}“ (${JSON.stringify(data).slice(0, 250)}).`);
    }

    return {
        description,
        tokens: data?.usage?.total_tokens ?? 0,
    };
}

module.exports = {
    generateDescription,
};
