/**
 * Generování popisů AI modelů (česky a anglicky).
 *
 * Popis je delší text o modelu, který má uživatele zaujmout,
 * srozumitelně vysvětlit, co model umí, jak funguje a k čemu jej lze použít.
 * Český text vzniká z údajů o modelu, anglický je jeho překladem.
 * Hotové popisy se ukládají do databáze, takže se stejná verze zadání nezpracovává víckrát.
 */

const AIModel = require("../models/AIModel");
const { requestCompletion } = require("./aiCompletion");

// Delší text se do karty nevejde, proto se ořezává
const MAX_DESCRIPTION_LENGTH = 2200;

const MIN_DESCRIPTION_LENGTH = 600;

// Kratší překlad už nestačí na to, aby popisek dával smysl
const MIN_TRANSLATION_LENGTH = 300;

// Verze zadání popisu - při změně pravidel se popisy ze staré verze vygenerují znovu
// (anglický překlad se doplňuje i k popiskům z aktuální verze, nemění to jejich češtinu)
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

// Pravidla psaní popisků - sdílí je jednotlivé i dávkové zadání
const DESCRIPTION_RULES = [
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
];

/** Sestaví seznam faktů o modelu, které AI dostane jako podklad pro popisek. */
function buildModelFacts(model) {
    const tags = selectMeaningfulTags(model.tags);

    return [
        model.modelId ? `Identifikátor modelu: ${model.modelId}` : null,
        model.author ? `Autor: ${model.author}` : null,
        model.task ? `Hlavní úloha: ${model.task}` : null,
        model.library ? `Knihovna: ${model.library}` : null,
        model.license ? `Licence: ${model.license}` : null,
        model.parameters ? `Velikost: ${formatParameters(model.parameters)} parametrů` : null,
        model.languages?.length ? `Jazyky: ${model.languages.join(", ")}` : null,
        tags.length > 0 ? `Významné štítky: ${tags.join(", ")}` : null,
    ].filter(Boolean);
}

/** Sestaví zadání pro model z údajů, které o modelu víme. */
function buildPrompt(model) {
    return [
        "Napiš obsáhlejší popis tohoto AI modelu pro český katalog.",
        "",
        "POŽADAVKY:",
        ...DESCRIPTION_RULES,
        "",
        "PŘÍKLADY POŽADOVANÉHO STYLU:",
        ...STYLE_EXAMPLES.map((example) => `- ${example}`),
        "",
        "DOSTUPNÁ DATA O MODELU:",
        ...buildModelFacts(model),
    ].join("\n");
}

/** Sestaví zadání pro dávkové generování - popisky několika modelů v jedné odpovědi. */
function buildBatchPrompt(models) {
    return [
        `Napiš obsáhlejší popis pro každý z ${models.length} AI modelů uvedených níže (pro český katalog).`,
        "",
        "FORMÁT ODPOVĚDI:",
        "- odpověz pouze JSON polem, kde každá položka má tvar",
        '  {"model": "identifikátor modelu", "popis": "text popisku"}',
        "- pole obsahuje přesně jednu položku za každý model, ve stejném pořadí, v jakém jsou uvedené",
        "- identifikátor modelu převezměte přesně z podkladů, nic jiného kolem JSON nepište",
        "",
        "POŽADAVKY NA KAŽDÝ POPISEK:",
        ...DESCRIPTION_RULES,
        "",
        "PŘÍKLADY POŽADOVANÉHO STYLU:",
        ...STYLE_EXAMPLES.map((example) => `- ${example}`),
        "",
        "MODELY:",
        ...models.flatMap((model) => ["", `### ${model.modelId}`, ...buildModelFacts(model)]),
    ].join("\n");
}

// Anglický popis vzniká překladem hotového českého textu, aby obě verze říkaly totéž
const TRANSLATION_SYSTEM_PROMPT = [
    "Jsi zkušený překladatel technických textů z češtiny do angličtiny.",
    "Překládáš popisy AI modelů pro anglickou verzi katalogu.",
    "Překlad musí znít přirozeně, jako by ho psal rodilý mluvčí - ne jako strojový překlad.",
    "Zachovej význam, strukturu odstavců, tón i všechny konkrétní údaje.",
    "Názvy modelů, knihoven, nástrojů, benchmarků, čísla, jednotky a identifikátory",
    "nech v původní podobě.",
    "Nic nepřidávej, nic nevynechávej a nic nevysvětluj.",
].join(" ");

const TRANSLATION_RULES = [
    "- zachovej odstavce oddělené prázdným řádkem i přibližnou délku textu",
    "- překládej jen text, ne názvy modelů, knihoven, nástrojů ani benchmarků",
    "- nepřidávej ani neubírej informace a nic nedomýšlej",
    "- nevkládej nadpisy, odrážky ani poznámky překladatele",
];

/** Sestaví zadání pro překlad popisků do angličtiny (dávka modelů v jedné odpovědi). */
function buildTranslationPrompt(items) {
    return [
        `Přelož do angličtiny popisy ${items.length} AI modelů uvedených níže.`,
        "",
        "FORMÁT ODPOVĚDI:",
        "- odpověz pouze JSON polem, kde každá položka má tvar",
        '  {"model": "identifikátor modelu", "en": "anglický překlad popisu"}',
        "- pole obsahuje přesně jednu položku za každý model, ve stejném pořadí",
        "- identifikátor modelu převezmi přesně z podkladů, nic jiného kolem JSON nepiš",
        "",
        "PRAVIDLA PŘEKLADU:",
        ...TRANSLATION_RULES,
        "",
        "POPISKY:",
        JSON.stringify(
            items.map(({ modelId, description }) => ({ model: modelId, cs: description })),
            null,
            2
        ),
    ].join("\n");
}

/**
 * Přeloží české popisky do angličtiny jedním voláním AI.
 * Vrací mapu identifikátor - anglický text (chybějící překlady v mapě nejsou).
 */
async function translateDescriptions(items) {
    if (items.length === 0) {
        return new Map();
    }

    const data = await requestCompletion({
        system: TRANSLATION_SYSTEM_PROMPT,
        prompt: buildTranslationPrompt(items),
        temperature: 0.3,
        // Strop 950 tokenů na položku a 4000 celkem kvůli poskytovatelům s nižším limitem výstupu
        maxTokens: Math.min(950 * items.length, 4000),
        validate: (response) => {
            try {
                return parseBatchResponse(response?.choices?.[0]?.message?.content).length > 0;
            } catch {
                return false;
            }
        },
    });

    const parsed = parseBatchResponse(data?.choices?.[0]?.message?.content);
    const translations = new Map();
    const usedModelIds = new Set();

    parsed.forEach((item, index) => {
        const text = cleanSummary(item?.en ?? item?.popis ?? item?.text ?? item?.translation);

        if (text.length < MIN_TRANSLATION_LENGTH) {
            return;
        }

        // Stejná záloha pořadí jako u českých popisků, kdyby AI poškodilo identifikátor
        let modelId = typeof item?.model === "string" ? item.model.trim() : "";

        if (!items.some((entry) => entry.modelId === modelId) && parsed.length === items.length) {
            modelId = items[index]?.modelId ?? "";
        }

        if (modelId && !usedModelIds.has(modelId)) {
            usedModelIds.add(modelId);
            translations.set(modelId, text);
        }
    });

    return translations;
}

/** Vyčistí odpověď AI tak, aby se dala uložit a zobrazit (odstavce se zachovají). */
function cleanSummary(text) {
    const cleaned = String(text ?? "")
        .replace(/\r\n?/g, "\n")
        .split(/\n{2,}/)
        .map((paragraph) => paragraph
            .replace(/^\s*(?:popis|popisy|description|descriptions|translation|překlad|anglicky|english)\s*:\s*/i, "")
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

/** Uložený český popisek aktuální verze (jinak null). */
function storedDescriptionText(model) {
    return model.description?.version === DESCRIPTION_VERSION
        ? (model.description?.text?.trim() || null)
        : null;
}

/** Vygeneruje popis jednoho modelu v češtině i angličtině (vrací i počet spotřebovaných tokenů). */
async function generateDescription(model) {
    let description = storedDescriptionText(model);
    let tokens = 0;

    // Český popisek aktuální verze se znovu negeneruje, jen se k němu doplní překlad
    if (!description) {
        const data = await requestCompletion({
            system: SYSTEM_PROMPT,
            prompt: buildPrompt(model),
            validate: (response) => (
                String(response?.choices?.[0]?.message?.content ?? "").trim().length >= MIN_DESCRIPTION_LENGTH
            ),
        });

        description = cleanSummary(data?.choices?.[0]?.message?.content);
        tokens = data?.usage?.total_tokens ?? 0;

        if (description.length < MIN_DESCRIPTION_LENGTH) {
            // V chybě je i náhled odpovědi, aby bylo vidět, co poskytovatel skutečně vrátil
            throw new Error(`Model vrátil příliš krátký popisek: „${description}“ (${JSON.stringify(data).slice(0, 250)}).`);
        }
    }

    const translations = await translateDescriptions([{ modelId: model.modelId, description }]);
    const descriptionEn = translations.get(model.modelId);

    if (!descriptionEn) {
        throw new Error(`Model „${model.modelId}“ nemá použitelný anglický překlad popisku.`);
    }

    return {
        description,
        descriptionEn,
        tokens,
    };
}

/** Převede JSON text na pole položek, objekt {identifikátor: popisek} se převede na pole. */
function tryParseItems(jsonText) {
    try {
        const parsed = JSON.parse(jsonText);

        if (Array.isArray(parsed)) {
            return parsed;
        }

        if (parsed && typeof parsed === "object") {
            return Object.entries(parsed).map(([model, popis]) => ({ model, popis }));
        }
    } catch {
        // Nevalidní JSON - zkouší se dál zkrácená podoba
    }

    return null;
}

/**
 * Vytáhne z odpovědi AI popisky. Čeká JSON pole položek (toleruje objekt místo pole
 * a text kolem), uříznutou odpověď zachrání po poslední kompletní položku, aby se
 * kvůli jednomu nedokončenému popisku nezahodila celá dávka.
 */
function parseBatchResponse(content) {
    const text = String(content ?? "").trim();
    const start = text.search(/[[{]/);

    if (start === -1) {
        throw new Error(`AI nevrátilo JSON popisků: „${text.slice(0, 250)}“`);
    }

    const body = text.slice(start);
    const closing = body[0] === "[" ? "]" : "}";

    // Od konce se odpověď zkracuje na poslední uzavřenou položku, dokud JSON neprojde
    for (let cut = body.length; cut > 1;) {
        const closeIndex = body.lastIndexOf("}", cut - 1);

        if (closeIndex < 0) {
            break;
        }

        const items = tryParseItems(body.slice(0, closeIndex + 1))
            ?? tryParseItems(body.slice(0, closeIndex + 1) + closing);

        if (items) {
            return items;
        }

        cut = closeIndex;
    }

    throw new Error(`Popisky se nepodařilo přečíst jako JSON: „${text.slice(0, 250)}“`);
}

/**
 * Doplní popisky několika modelů: chybějící české texty vygeneruje v jednom volání AI,
 * existující české popisky jen přeloží do angličtiny.
 * Vrací jen modely, pro které vznikly obě verze - ostatní fronta zkusí znovu.
 */
async function generateDescriptions(models) {
    const czechById = new Map();

    // Modely bez aktuálního českého popisku se vygenerují v jedné dávce
    const missingCzech = models.filter((model) => !storedDescriptionText(model));

    if (missingCzech.length > 0) {
        const data = await requestCompletion({
            system: SYSTEM_PROMPT,
            prompt: buildBatchPrompt(missingCzech),
            // Delší odpověď musí pokrýt všechny popisky z dávky, rezervované tokeny se ale počítají
            // do minutového limitu poskytovatele, proto se drží co nejníž
            maxTokens: Math.min(1100 * missingCzech.length, 6400),
            validate: (response) => {
                try {
                    return parseBatchResponse(response?.choices?.[0]?.message?.content).length > 0;
                } catch {
                    return false;
                }
            },
        });

        const items = parseBatchResponse(data?.choices?.[0]?.message?.content);
        const usedModelIds = new Set();

        items.forEach((item, index) => {
            const description = cleanSummary(item?.popis);

            if (description.length < MIN_DESCRIPTION_LENGTH) {
                return;
            }

            // Položka se spáruje podle identifikátoru, když AI vrátí všechny položky ve stejném
            // pořadí, ale s poškozeným identifikátorem, poslouží jako záloha pořadí v poli
            let modelId = typeof item?.model === "string" ? item.model.trim() : "";

            if (!missingCzech.some((model) => model.modelId === modelId) && items.length === missingCzech.length) {
                modelId = missingCzech[index]?.modelId ?? "";
            }

            if (modelId && !usedModelIds.has(modelId)) {
                usedModelIds.add(modelId);
                czechById.set(modelId, description);
            }
        });
    }

    // K modelům s hotovým českým popiskem se jen doplní překlad, čeština zůstane stejná
    models.forEach((model) => {
        if (!czechById.has(model.modelId)) {
            const description = storedDescriptionText(model);

            if (description) {
                czechById.set(model.modelId, description);
            }
        }
    });

    if (czechById.size === 0) {
        return [];
    }

    // Překlad se dělá jedním voláním pro celou dávku
    const translations = await translateDescriptions(
        [...czechById].map(([modelId, description]) => ({ modelId, description }))
    );

    return [...czechById]
        .map(([modelId, description]) => ({
            modelId,
            description,
            descriptionEn: translations.get(modelId) ?? null,
        }))
        .filter((result) => Boolean(result.descriptionEn));
}

/**
 * Přečte hotové popisky z databáze (bez volání AI) v požadovaném jazyce.
 *
 * Vrací jen popisky z aktuální verze zadání; chybějící si požadavek
 * zařadí do fronty na pozadí (services/generationQueue).
 */
async function getStoredDescriptions(modelIds, language = "cs") {
    const ids = [...new Set((modelIds ?? []).filter((id) => typeof id === "string" && id.trim().length > 0))];

    if (ids.length === 0) {
        return [];
    }

    // Popisek ze starší verze zadání nebo bez překladu se klientovi neposílá -
    // vygeneruje se znovu na pozadí
    return (await AIModel.find(
        { modelId: { $in: ids } },
        { modelId: 1, description: 1 }
    ).lean())
        .filter((item) => item.description?.version === DESCRIPTION_VERSION)
        .map((item) => ({
            modelId: item.modelId,
            description: descriptionText(item.description, language),
        }))
        .filter((item) => Boolean(item.description));
}

/** Vrátí popis v požadovaném jazyce (anglický bez překladu zůstane prázdný). */
function descriptionText(description, language) {
    const text = language === "en" ? description?.textEn : description?.text;

    return text?.trim() || null;
}

module.exports = {
    DESCRIPTION_VERSION,
    generateDescription,
    generateDescriptions,
    getStoredDescriptions,
};
