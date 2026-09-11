/** Jedna možnost řazení modelů ve výběru nad výpisem. */
export interface SortOption {
    // Hodnota řazení, posílá se do API jako parametr
    value: string;
    // Popisek zobrazený uživateli
    label: string;
}

/**
 * Možnosti řazení modelů, jejich pořadí odpovídá zobrazení ve výběru.
 * První možnost je výchozí řazení. Nové řazení = nový záznam tady
 * (hodnotu musí umět přeložit i server, viz SORT_PARAMS v huggingFaceService).
 */
export const MODEL_SORTS_CONFIG = [
    {
        value: "popularity",
        label: "Nejpopulárnější",
    },
    {
        value: "recent",
        label: "Nejnovější",
    },
] as const satisfies readonly SortOption[];


/** Způsoby řazení modelů odvozené z konfigurace. */
export type ModelSortKey = (typeof MODEL_SORTS_CONFIG)[number]["value"];

/** Výchozí řazení výpisu modelů (první možnost z konfigurace). */
export const DEFAULT_SORT: ModelSortKey = MODEL_SORTS_CONFIG[0].value;
