/** Jedna možnost řazení modelů ve výběru nad výpisem. */
export interface SortOption {
    // Hodnota řazení, posílá se do API jako parametr
    value: string;
    // Popisek zobrazený uživateli
    label: string;
}

/**
 * Možnosti řazení modelů, jejich pořadí odpovídá zobrazení ve výběru.
 * První možnost je výchozí řazení. Každá hodnota musí mít odpovídající
 * překlad na serveru v SORT_PARAMS v huggingFaceService.
 */
export const MODEL_SORTS_CONFIG = [
    {
        value: "popularity",
        label: "Popularita",
    },
    {
        value: "downloads",
        label: "Počet stažení",
    },
    {
        value: "likes",
        label: "Počet oblíbených",
    },
    {
        value: "created",
        label: "Datum přidání",
    },
] as const satisfies readonly SortOption[];


/** Způsoby řazení modelů odvozené z konfigurace. */
export type ModelSortKey = (typeof MODEL_SORTS_CONFIG)[number]["value"];

/** Výchozí řazení výpisu modelů (první možnost z konfigurace). */
export const DEFAULT_SORT: ModelSortKey = MODEL_SORTS_CONFIG[0].value;
