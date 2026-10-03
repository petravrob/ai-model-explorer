import { SORT_QUERY_PARAM, TAB_QUERY_PARAM } from "@/routes/paths";

import { MODEL_FILTERS_CONFIG, type FilterOption, type ModelFilters } from "../filters";
import { DEFAULT_SORT, MODEL_SORTS_CONFIG, type ModelSortKey } from "../modelSortsConfig";
import { DEFAULT_TAB, MODEL_TABS_CONFIG, type ModelTabKey } from "../modelTabsConfig";

/**
 * Zvolené filtry, řazení a štítek výpisu se drží v URL (stejně jako hledaný výraz).
 */

/** Hodnoty řazení, které umí aplikace přečíst z URL (neznámá hodnota se ignoruje). */
const SORT_VALUES: readonly string[] = MODEL_SORTS_CONFIG.map((sortOption) => sortOption.value);

/** Hodnoty štítků, které umí aplikace přečíst z URL (neznámá hodnota se ignoruje). */
const TAB_VALUES: readonly string[] = MODEL_TABS_CONFIG.map((tabOption) => tabOption.value);

/** Posbírá hodnoty nabídky kategorie filtrů (i z vnořených podkategorií). */
const collectOptionValues = (options: readonly FilterOption[]): Set<string> => {

    const values = new Set<string>();

    const walk = (items: readonly FilterOption[]): void => {
        items.forEach((item) => {
            values.add(item.value);

            if (item.children) {
                walk(item.children);
            }
        });
    };

    walk(options);

    return values;
};

/**
 * Klíč zvolených filtrů z URL. Mění se jen s hodnotami filtrů, ne s hledaným výrazem,
 * který je v URL také - díky tomu se filtry nepřepočítají při každém psaní do vyhledání.
 */
export const buildFiltersParamsKey = (params: URLSearchParams): string =>
    MODEL_FILTERS_CONFIG
        .map((filterConfig) => params.getAll(filterConfig.key).join(","))
        .join("|");

/** Přečte zvolené filtry z URL. Neznámé hodnoty se zahodí, aby se s nimi neposílal požadavek na server. */
export const readFiltersFromParams = (params: URLSearchParams): ModelFilters =>
    MODEL_FILTERS_CONFIG.reduce<ModelFilters>(
        (filters, filterConfig) => {
            const optionValues = collectOptionValues(filterConfig.options);

            const selectedValues = params
                .getAll(filterConfig.key)
                .filter((value) => optionValues.has(value));

            return {
                ...filters,
                [filterConfig.key]: [...new Set(selectedValues)],
            };
        },
        {} as ModelFilters
    );

/** Zapíše zvolené filtry do URL. */
export const writeFiltersToParams = (params: URLSearchParams, filters: ModelFilters): void => {

    MODEL_FILTERS_CONFIG.forEach((filterConfig) => {
        params.delete(filterConfig.key);

        // Zvolené hodnoty kategorie se v URL opakují (např. „?tasks=text&tasks=translation“)
        (filters[filterConfig.key] ?? []).forEach((value) =>
            params.append(filterConfig.key, value)
        );
    });
};

/** Přečte řazení z URL (výchozí řazení se v URL neuvádí). */
export const readSortFromParams = (params: URLSearchParams): ModelSortKey => {

    const value = params.get(SORT_QUERY_PARAM);

    return value && SORT_VALUES.includes(value)
        ? (value as ModelSortKey)
        : DEFAULT_SORT;
};

/** Zapíše řazení do URL (výchozí řazení se z URL odstraní). */
export const writeSortToParams = (params: URLSearchParams, sort: ModelSortKey): void => {

    if (sort === DEFAULT_SORT) {
        params.delete(SORT_QUERY_PARAM);
        return;
    }

    params.set(SORT_QUERY_PARAM, sort);
};

/** Přečte štítek výpisu z URL (výchozí štítek se v URL neuvádí). */
export const readTabFromParams = (params: URLSearchParams): ModelTabKey => {

    const value = params.get(TAB_QUERY_PARAM);

    return value && TAB_VALUES.includes(value)
        ? (value as ModelTabKey)
        : DEFAULT_TAB;
};

/** Zapíše štítek výpisu do URL (výchozí štítek se z URL odstraní). */
export const writeTabToParams = (params: URLSearchParams, tab: ModelTabKey): void => {

    if (tab === DEFAULT_TAB) {
        params.delete(TAB_QUERY_PARAM);
        return;
    }

    params.set(TAB_QUERY_PARAM, tab);
};
