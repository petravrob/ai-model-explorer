/**
 * Generování krátkých českých popisků AI modelů.
 *
 * Popisek má uživateli rychle sdělit, co je na modelu zajímavé a k čemu se hodí.
 * Generuje se podle potřeby pro modely, které jsou zrovna vidět, a hotové popisky
 * se ukládají do databáze, takže se každý model generuje jen jednou.
 */

const { SUMMARY_ENABLED } = require("../config/env");
const ModelDescription = require("../models/ModelDescription");
const { requestCompletion } = require("./aiCompletion");

// Delší text se do karty nevejde, proto se ořezává
const MAX_DESCRIPTION_LENGTH = 300;

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

/** Vygeneruje českou anotaci jednoho modelu (vrací i počet spotřebovaných tokenů). */
async function generateDescription(model) {
    const data = await requestCompletion({ system: SYSTEM_PROMPT, prompt: buildPrompt(model) });
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

// Kolik popisků se vygeneruje na jedno vyžádání aplikace (zbytek se doplní postupně)
const MAX_DESCRIPTIONS_PER_REQUEST = 3;

// Modely, u kterých právě běží generování, aby se stejný popisek negeneroval víckrát
const pendingGenerations = new Set();

/**
 * Vygeneruje popisky pro modely, které aplikace právě zobrazuje.
 *
 * Aplikace si o popisky říká postupně, takže se generují jen viditelné modely.
 * Hotové popisky se ukládají do databáze. Bez nastaveného klíče se nic neposílá.
 */
async function generateDescriptions(models) {
    if (!SUMMARY_ENABLED) {
        return [];
    }

    const wanted = (models ?? [])
        .filter((model) => model?.modelId && !model.description?.trim() && !pendingGenerations.has(model.modelId))
        .slice(0, MAX_DESCRIPTIONS_PER_REQUEST);

    if (wanted.length === 0) {
        return [];
    }

    // Uložený popisek se do AI neposílá znovu - klient o něm ještě nemusí vědět
    const storedDescriptions = new Map(
        (await ModelDescription.find(
            { modelId: { $in: wanted.map((model) => model.modelId) } },
            { modelId: 1, description: 1 }
        )).map((item) => [item.modelId, item.description])
    );

    const generated = await Promise.all(wanted.map(async (model) => {
        const storedDescription = storedDescriptions.get(model.modelId);

        if (storedDescription) {
            return { modelId: model.modelId, description: storedDescription };
        }

        pendingGenerations.add(model.modelId);

        try {
            const { description } = await generateDescription(model);

            await ModelDescription.updateOne({ modelId: model.modelId }, { $set: { description } }, { upsert: true });

            return { modelId: model.modelId, description };
        } catch (error) {
            console.error(`Popisek modelu „${model.modelId}“ se nepodařilo vygenerovat: ${error.message}`);

            return null;
        } finally {
            pendingGenerations.delete(model.modelId);
        }
    }));

    return generated.filter(Boolean);
}

module.exports = {
    generateDescription,
    generateDescriptions,
};
