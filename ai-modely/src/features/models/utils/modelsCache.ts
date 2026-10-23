import type { ModelFilters } from "../filters";
import type { ModelSortKey } from "../modelSortsConfig";
import type { ModelTabKey } from "../modelTabsConfig";
import type { AIModel } from "../types";

// Poslední výpis v paměti stránky, aby se po návratu z detailu ukázal hned

// Při přeplnění se cache vyprázdní, ať paměť neroste
const MODELS_CACHE_LIMIT = 12;

const modelsCache = new Map<string, AIModel[]>();

/** Klíč výpisu podle štítku, řazení a filtrů. */
export const buildModelsCacheKey = (
    filters: ModelFilters,
    sort: ModelSortKey,
    tab: ModelTabKey
): string =>
    JSON.stringify({
        sort,
        tab,
        filters: Object.entries(filters).sort(([a], [b]) => a.localeCompare(b)),
    });

/** Uložený výpis (null, když se ještě nenačetl). */
export const readCachedModels = (key: string): AIModel[] | null =>
    modelsCache.get(key) ?? null;

/** Uloží výpis pro další zobrazení. */
export const saveCachedModels = (
    key: string,
    models: AIModel[]
): void => {

    if (modelsCache.size >= MODELS_CACHE_LIMIT && !modelsCache.has(key)) {
        modelsCache.clear();
    }

    modelsCache.set(key, models);
};
