/**
 * Názvy benchmarků, jejich částí a kategorií s českým vysvětlením pro UI.
 *
 * Oficiální názvy benchmarků a datasetů se nemění.
 * Čeština se používá pouze pro vysvětlení jejich významu
 * a pro obecné technické pojmy.
 */

type BenchmarkLabel = {
    label: string;
    description: string;
};

/** Převodní klíč: bez okrajových mezer, malými písmeny. */
const normalize = (text: string): string => text.trim().toLowerCase();

/**
 * Názvy konkrétních benchmarků a datasetů.
 *
 * Oficiální názvy zůstávají zachované.
 */
const BENCHMARK_NAMES: Record<string, BenchmarkLabel> = {
    "typed decisions": {
        label: "Typed Decisions",
        description:
            "Testuje schopnost modelu správně zařadit text do předem definované kategorie podle jeho významu.",
    },

    "ag news": {
        label: "AG News",
        description:
            "Testuje klasifikaci zpráv do čtyř tematických kategorií.",
    },

    "dair emotion": {
        label: "DAIR Emotion",
        description:
            "Testuje schopnost modelu rozpoznat emoci vyjádřenou v textu a přiřadit ji ke správné kategorii.",
    },

    banking77: {
        label: "Banking77",
        description:
            "Testuje rozpoznávání záměru zákazníka v bankovních dotazech.",
    },

    "banking77 pilot": {
        label: "Banking77 – pilotní test",
        description:
            "Předběžná varianta benchmarku Banking77 zaměřená na rozpoznávání záměru zákazníka v bankovních dotazech.",
    },

    "massive scenario classification": {
        label: "MASSIVE",
        description:
            "Testuje schopnost modelu rozpoznat záměr uživatele v různých situacích.",
    },

    "massive scenario classification – all 52 locales": {
        label: "MASSIVE – 52 jazykových variant",
        description:
            "Testuje rozpoznávání záměru uživatele napříč 52 různými jazykovými a regionálními variantami.",
    },

    "massive scenario classification – portuguese · pt-pt": {
        label: "MASSIVE – portugalština (pt-PT)",
        description:
            "Testuje rozpoznávání záměru uživatele v portugalštině používané v Portugalsku.",
    },

    "massive scenario classification – english · en-us": {
        label: "MASSIVE – angličtina (en-US)",
        description:
            "Testuje rozpoznávání záměru uživatele v americké angličtině.",
    },

    "massive intent, english": {
        label: "MASSIVE – angličtina",
        description:
            "Testuje, zda model správně pozná, co uživatel svým dotazem nebo sdělením zamýšlí.",
    },

    "massive intent, 13 other languages": {
        label: "MASSIVE – 13 dalších jazyků",
        description:
            "Ověřuje schopnost modelu rozpoznat záměr uživatele v různých jazycích.",
    },

    "xnli, english": {
        label: "XNLI – angličtina",
        description:
            "Testuje, zda model dokáže správně pochopit vztah mezi dvěma větami.",
    },

    "xnli, 14 other languages": {
        label: "XNLI – 14 dalších jazyků",
        description:
            "Ověřuje, zda model rozumí významu a vztahu mezi větami v různých jazycích.",
    },
};

/**
 * Obecné technické pojmy používané v názvech benchmarků.
 */
const BENCHMARK_TERMS: Record<string, BenchmarkLabel> = {
    labels: {
        label: "kategorií",
        description:
            "Počet možných kategorií, do kterých může model zařadit testovaný text.",
    },

    label: {
        label: "kategorie",
        description:
            "Jedna z předem definovaných kategorií, do které může model zařadit testovaný text.",
    },

    accuracy: {
        label: "přesnost",
        description:
            "Podíl testovaných případů, které model zařadil správně.",
    },

    pilot: {
        label: "pilotní test",
        description:
            "Předběžná nebo omezená varianta benchmarku, která nemusí pokrývat celý rozsah standardního testu.",
    },

    "scenario classification": {
        label: "klasifikace situací",
        description:
            "Úloha, při které model určuje, do jaké předem definované situace nebo kategorie text patří.",
    },

    "intent classification": {
        label: "klasifikace záměru",
        description:
            "Úloha, při které model určuje, jaký záměr se skrývá za textovým dotazem nebo zprávou.",
    },

    "intent detection": {
        label: "rozpoznání záměru",
        description:
            "Model určuje, co člověk svým dotazem nebo zprávou zamýšlí.",
    },

    "emotion classification": {
        label: "rozpoznání emocí",
        description:
            "Model určuje emoci nebo emoční kategorii vyjádřenou v textu.",
    },

    "text classification": {
        label: "klasifikace textu",
        description:
            "Model přiřazuje text k jedné z předem definovaných kategorií podle jeho obsahu a významu.",
    },

    locale: {
        label: "jazyková varianta",
        description:
            "Určuje konkrétní kombinaci jazyka a regionu, například en-US nebo pt-PT.",
    },

    locales: {
        label: "jazykových variant",
        description:
            "Počet různých jazykových nebo regionálních variant zahrnutých v testu.",
    },

    english: {
        label: "angličtina",
        description:
            "Testování modelu na anglických textech.",
    },

    portuguese: {
        label: "portugalština",
        description:
            "Testování modelu na textech v portugalštině.",
    },

    "all 52 locales": {
        label: "52 jazykových variant",
        description:
            "Výsledek zahrnující všech 52 jazykových a regionálních variant benchmarku.",
    },
};

/**
 * Kategorie (oblasti), které benchmark hodnotí.
 */
const BENCHMARK_CATEGORIES: Record<string, BenchmarkLabel> = {
    "intent detection": {
        label: "Rozpoznání záměru",
        description:
            "Model určuje, co člověk svým dotazem nebo zprávou zamýšlí, a přiřazuje text k odpovídající kategorii.",
    },

    "obecné znalosti": {
        label: "Porozumění jazyku",
        description:
            "Hodnotí, jak dobře model rozumí významu a souvislostem v textu.",
    },

    "text classification": {
        label: "Klasifikace textu",
        description:
            "Model přiřazuje text k jedné z předem definovaných kategorií podle jeho obsahu a významu.",
    },

    "intent classification": {
        label: "Klasifikace záměru",
        description:
            "Model určuje, jaký záměr se skrývá za textovým dotazem nebo zprávou.",
    },

    "emotion classification": {
        label: "Rozpoznání emocí",
        description:
            "Model určuje emoci nebo emoční kategorii vyjádřenou v textu.",
    },

    "scenario classification": {
        label: "Klasifikace situací",
        description:
            "Model určuje, do jaké předem definované situace nebo kategorie daný text patří.",
    },
};

/**
 * Přeloží obecné části složeného názvu benchmarku.
 *
 * Například:
 * "AG News · 4 labels" → "AG News · 4 kategorií"
 *
 * U názvů benchmarků se zachovává jejich oficiální název.
 */
const translateBenchmarkParts = (name: string): string => {
    let result = name;

    result = result.replace(/\blabels\b/gi, "kategorií");
    result = result.replace(/\blabel\b/gi, "kategorie");
    result = result.replace(/\bpilot\b/gi, "pilotní test");
    result = result.replace(
        /\ball 52 locales\b/gi,
        "52 jazykových variant",
    );
    result = result.replace(/\blocales\b/gi, "jazykových variant");
    result = result.replace(/\bPortuguese\b/gi, "portugalština");
    result = result.replace(/\bEnglish\b/gi, "angličtina");

    return result;
};

/**
 * Český název benchmarku.
 *
 * Nejprve se hledá přesná definice konkrétního benchmarku.
 * Pokud přesná definice neexistuje, přeloží se obecné části
 * složeného názvu a zachová se oficiální název benchmarku.
 */
export const getBenchmarkNameLabel = (name: string): string => {
    const normalizedName = normalize(name);
    const exactMatch = BENCHMARK_NAMES[normalizedName];

    if (exactMatch) {
        return exactMatch.label;
    }

    return translateBenchmarkParts(name);
};

/** Vysvětlení benchmarku nebo datasetu. */
export const getBenchmarkNameDescription = (name: string): string =>
    BENCHMARK_NAMES[normalize(name)]?.description ??
    "Tento test slouží k měření schopností modelu v konkrétní oblasti.";

/** Český název kategorie benchmarku. */
export const getBenchmarkCategoryLabel = (category: string): string =>
    BENCHMARK_CATEGORIES[normalize(category)]?.label ?? category;

/** Vysvětlení kategorie benchmarku. */
export const getBenchmarkCategoryDescription = (category: string): string =>
    BENCHMARK_CATEGORIES[normalize(category)]?.description ??
    "Tato oblast popisuje schopnost, kterou benchmark u modelu ověřuje.";

/** Český název technického pojmu. */
export const getBenchmarkTermLabel = (term: string): string =>
    BENCHMARK_TERMS[normalize(term)]?.label ?? term;

/** Vysvětlení technického pojmu. */
export const getBenchmarkTermDescription = (term: string): string =>
    BENCHMARK_TERMS[normalize(term)]?.description ??
    "Tento pojem popisuje vlastnost nebo parametr použitého benchmarku.";
