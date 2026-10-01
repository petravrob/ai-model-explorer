/**
 * České názvy benchmarků a kategorií s vysvětlením pro zobrazení v UI
 *
 * Data z dokumentace se nemění - české názvy a vysvětlení se doplňují pouze při vykreslení v UI.
 */

type BenchmarkLabel = {
    label: string;
    description: string;
};

/** Převodní klíč: bez okrajových mezer, malými písmeny. */
const normalize = (text: string): string => text.trim().toLowerCase();

/**
 * Názvy benchmarků podle dokumentace modelů.
 */
const BENCHMARK_NAMES: Record<string, BenchmarkLabel> = {
    "massive intent, english": {
        label: "Angličtina",
        description:
            "Testuje, zda model správně pozná, co uživatel svým dotazem nebo sdělením zamýšlí.",
    },

    "massive intent, 13 other languages": {
        label: "13 dalších jazyků",
        description:
            "Ověřuje schopnost modelu rozpoznat záměr uživatele v různých jazycích.",
    },

    "xnli, english": {
        label: "Angličtina",
        description:
            "Testuje, zda model dokáže správně pochopit vztah mezi dvěma větami.",
    },

    "xnli, 14 other languages": {
        label: "14 dalších jazyků",
        description:
            "Ověřuje, zda model rozumí významu a vztahu mezi větami v různých jazycích.",
    },
};

/**
 * Kategorie (oblasti), které benchmark hodnotí.
 */
const BENCHMARK_CATEGORIES: Record<string, BenchmarkLabel> = {
    "intent detection": {
        label: "Rozpoznání záměru",
        description:
            "Model se snaží určit, co člověk svým dotazem nebo zprávou zamýšlí.",
    },

    "obecné znalosti": {
        label: "Porozumění jazyku",
        description:
            "Hodnotí, jak dobře model rozumí významu a souvislostem v textu.",
    },
};

/** Český název benchmarku. */
export const getBenchmarkNameLabel = (name: string): string =>
    BENCHMARK_NAMES[normalize(name)]?.label ?? name;

/** Vysvětlení benchmarku. */
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
