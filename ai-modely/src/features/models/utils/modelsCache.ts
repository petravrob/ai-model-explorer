import type { ModelFilters } from "../filters";
import type { ModelSortKey } from "../modelSortsConfig";
import type { ModelTabKey } from "../modelTabsConfig";
import type { AIModel } from "../types";

// Načtené AI modely se drží v paměti stránky. Po návratu z detailu modelu se tak
// poslední výpis zobrazí hned a obnoví se až na pozadí.

// Aby paměť nerostla, při přeplnění se cache vyprázdní
const MODELS_CACHE_LIMIT = 12;

const modelsCache = new Map<string, AIModel[]>();

/** Sestaví klíč výsledku AI modelů podle štítku, řazení a zvolených filtrů. */
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

/** Uložený výpis modelů (null, když se pro tyto parametry ještě nenačetl). */
export const readCachedModels = (key: string): AIModel[] | null =>
    modelsCache.get(key) ?? null;

/** Uloží načtený výpis modelů pro další zobrazení. */
export const saveCachedModels = (
    key: string,
    models: AIModel[]
): void => {

    if (modelsCache.size >= MODELS_CACHE_LIMIT && !modelsCache.has(key)) {
        modelsCache.clear();
    }

    modelsCache.set(key, models);
};
