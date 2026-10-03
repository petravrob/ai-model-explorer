/**
 * Generování českých popisů AI modelů.
 *
 * Popis je delší text o modelu, který má uživatele zaujmout,
 * srozumitelně vysvětlit, co model umí, jak funguje a k čemu jej lze použít.
 * Hotové popisy se ukládají do databáze, takže se stejná verze zadání nezpracovává víckrát.
 */

const { SUMMARY_ENABLED } = require("../config/env");
const AIModel = require("../models/AIModel");
const { requestCompletion } = require("./aiCompletion");

// Delší text se do karty nevejde, proto se ořezává
const MAX_DESCRIPTION_LENGTH = 2200;

const MIN_DESCRIPTION_LENGTH = 600;

// Verze zadání popisu - při změně pravidel se popisy ze staré verze vygenerují znovu
const DESCRIPTION_VERSION = "v4";

// Jak se má model chovat (píše popis modelu, nic si nevymýšlí)
const SYSTEM_PROMPT = [
    "Jsi redaktor českého katalogu AI modelů a umíš o technice psát srozumitelně a poutavě.",
    "Píšeš delší popisy AI modelů pro běžné čtenáře, kteří se v umělé inteligenci nevyznají,",
    "ale rádi by pochopili, co model umí, jak funguje a k čemu jim může být.",
    "Čtenář už na kartě vidí název modelu, autora, štítky a základní statistiky,",
    "proto je v textu mechanicky neopakuj.",
    "Piš přirozenou spisovnou češtinou, jakou by použil zkušený redaktor populárně naučného časopisu -",
    "věcně a přesně, ale živě, aby text čtenáře bavil a motivoval ho model si otevřít a vyzkoušet.",
    "Dbáš na přirozený český slovosled a hladkou skladbu vět - text musí znít, jako by ho psal",
    "rodilý mluvčí, nikoli jako překlad z angličtiny.",
    "Odborné pojmy používej střídmě a vždy je hned jednoduše vysvětli.",
    "Nevytvářej obecné marketingové fráze a nepoužívej výrazy jako „výkonný“, „všestranný“,",
    "„moderní“, „pokročilý“ nebo „ideální pro mnoho úloh“, pokud nejsou podložené konkrétní informací.",
    "Nevymýšlej schopnosti, benchmarky, kvalitu, rychlost ani použití, které nejsou v dodaných datech.",
].join(" ");

// Ukázky tónu (nejde o šablony, jen o příklady stylistiky vět)
const STYLE_EXAMPLES = [
    "Dlouhý dokument, který by člověk četl hodiny, zvládne projít najednou - a na dotaz z něj vytáhne přesně tu pasáž, kterou potřebujete.",
    "Stačí mu popsat obrázek vlastními slovy a výsledek se dá ladit dalšími pokyny, dokud nevypadá přesně podle představ.",
    "Běží i bez připojení k internetu, takže si ho vývojář může spustit na vlastním počítači jako osobního asistenta pro psaní kódu.",
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
        "Napiš obsáhlejší popis tohoto AI modelu pro český katalog.",
        "",
        "POŽADAVKY:",
        "- napiš 2 až 3 odstavce oddělené prázdným řádkem, celkem přibližně 1000 znaků",
        "- přesnou délku nedodržuj za každou cenu - důležitější je, aby věty plynuly,",
        "  působily přirozeně a text jako celek dával smysl",
        "- dbávej na přirozený český slovosled a správnou skladbu vět: každá věta má znít",
        "  jako od rodilého mluvčího, ne jako překlad z angličtiny; přečti si ji v duchu",
        "  a když zní neohrabaně, přeformuluj ji",
        "- střídej délku vět a dávej pozor, aby věty na sebe navazovaly a nepůsobily odtrženě",
        "- přirozená a spisovná čeština, srozumitelná čtenáři s běžnými znalostmi o AI,",
        "  ale mírně odborná - čtenář si po přečtení musí umět představit, o jaký model",
        "  se jedná a k čemu mu v praxi bude",
        "- text musí být konkrétní pro tento model",
        "- první odstavec má zaujmout: co model umí a proč by to čtenáře mělo zajímat",
        "  (na kartě se ukazuje jen začátek textu, proto musí být úvod lákavý sám o sobě)",
        "- další odstavec srozumitelně vysvětlí princip, jak model funguje, a přidá zajímavost",
        "  (na jakých datech se učil, čím se liší od podobných modelů, v čem spočívá jeho trik)",
        "- poslední odstavec řekne, k čemu je model dobrý a jak si ho čtenář může spustit",
        "  nebo použít - uveď konkrétní příklady použití z běžného života, aby si i netechnický",
        "  čtenář uměl představit, jak s modelem bude pracovat",
        "- informace vybírej podle toho, co je pro tento model skutečně zajímavé",
        "- parametry, jazyky, licenci nebo knihovnu nepoužívej jen proto, že jsou dostupné",
        "- pokud je model něčím specializovaný, dej přednost této informaci před obecnými statistikami",
        "- pokud jsou dostupné informace o programování, obrazech, zvuku, multimodalitě, reasoning,",
        "  lokálním použití nebo jiné konkrétní schopnosti, využij je",
        "- název modelu ani autora neopakuj",
        "- nezačínej větou „Tento model...“",
        "- nepoužívej odrážky ani nadpisy",
        "- nevymýšlej žádné informace",
        "",
        "PŘÍKLADY POŽADOVANÉHO STYLU:",
        ...STYLE_EXAMPLES.map((example) => `- ${example}`),
        "",
        "DOSTUPNÁ DATA O MODELU:",
        ...facts,
    ].join("\n");
}

/** Vyčistí odpověď AI tak, aby se dala uložit a zobrazit (odstavce se zachovají). */
function cleanSummary(text) {
    const cleaned = String(text ?? "")
        .replace(/\r\n?/g, "\n")
        .split(/\n{2,}/)
        .map((paragraph) => paragraph
            .replace(/^\s*(?:popis|description|popisy)\s*:\s*/i, "")
            .replace(/^#{1,6}\s*/, "")
            .replace(/^[-*•]\s*/, "")
            .replace(/^\*\*(.*?)\*\*$/, "$1")
            .replace(/^[„“"'›»]+|[„“"'‹«]+$/g, "")
            .replace(/\s+/g, " ")
            .trim())
        .filter(Boolean)
        .join("\n\n");

    if (cleaned.length <= MAX_DESCRIPTION_LENGTH) {
        return cleaned;
    }

    // Příliš dlouhý text se zkrátí na konec posledního celého odstavce, věty nebo slova
    const shortened = cleaned.slice(0, MAX_DESCRIPTION_LENGTH);
    const paragraphEnd = shortened.lastIndexOf("\n\n");
    const sentenceEnd = shortened.lastIndexOf(". ");

    if (paragraphEnd > MAX_DESCRIPTION_LENGTH / 2) {
        return shortened.slice(0, paragraphEnd);
    }

    if (sentenceEnd > MAX_DESCRIPTION_LENGTH / 2) {
        return shortened.slice(0, sentenceEnd + 1);
    }

    return shortened.replace(/\s+\S*$/, "").trim();
}

/** Vygeneruje český popis jednoho modelu (vrací i počet spotřebovaných tokenů). */
async function generateDescription(model) {
    const data = await requestCompletion({ system: SYSTEM_PROMPT, prompt: buildPrompt(model) });
    const description = cleanSummary(data?.choices?.[0]?.message?.content);

    if (description.length < MIN_DESCRIPTION_LENGTH) {
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

    // Uložený popisek se do AI neposílá znovu - klient o něm ještě nemusí vědět.
    // Popisek ze starší verze zadání se ale vygeneruje znovu.
    const storedDescriptions = new Map(
        (await AIModel.find(
            { modelId: { $in: wanted.map((model) => model.modelId) } },
            { modelId: 1, description: 1 }
        ).lean())
            .filter((item) => item.description?.version === DESCRIPTION_VERSION && item.description?.text)
            .map((item) => [item.modelId, item.description.text])
    );

    const generated = await Promise.all(wanted.map(async (model) => {
        const storedDescription = storedDescriptions.get(model.modelId);

        if (storedDescription) {
            return { modelId: model.modelId, description: storedDescription };
        }

        pendingGenerations.add(model.modelId);

        try {
            const { description } = await generateDescription(model);

            // Popis je vložený přímo v dokumentu modelu, takže se čte jedním dotazem s modelem
            await AIModel.updateOne(
                { modelId: model.modelId },
                {
                    $set: {
                        description: {
                            text: description,
                            version: DESCRIPTION_VERSION,
                            status: "ok",
                            generatedAt: new Date(),
                        },
                    },
                }
            );

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
    DESCRIPTION_VERSION,
    generateDescription,
    generateDescriptions,
};
