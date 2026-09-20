import { AIModel } from "../types";
import {
    ModelFilterKey,
    ModelFilters,
    MODEL_FILTERS_CONFIG,
} from "../filters";

/** Sestaví prázdný výběr všech filtrů podle konfigurace (výpis modelů nijak nezúží). */
export const buildEmptyFilters = (): ModelFilters =>
    MODEL_FILTERS_CONFIG.reduce<ModelFilters>(
        (emptyFilters, filterConfig) => ({
            ...emptyFilters,
            [filterConfig.key]: [],
        }),
        {} as ModelFilters
    );

/** Určí, zda je nastaven alespoň jeden filtr. */
export const isAnyFilterActive = (filters: ModelFilters): boolean =>
    Object.values(filters).some((selection) => selection.length > 0);

/** Přepne výběr jedné hodnoty filtru (zaškrtnutí hodnotu přidá, odškrtnutí odebere). */
export const toggleFilterValue = (
    filters: ModelFilters,
    key: ModelFilterKey,
    value: string
): ModelFilters => {
    if (typeof value !== "string" || value.length === 0) {
        return filters;
    }

    const selectedValues = filters[key];

    const newValues = selectedValues.includes(value)
        ? selectedValues.filter((selected) => selected !== value)
        : [...selectedValues, value];

    return {
        ...filters,
        [key]: newValues,
    };
};

/** Normalizuje hodnotu filtru pro spolehlivé porovnání hodnot z Hugging Face API. */
const normalizeFilterValue = (value: string): string =>
    value.trim().toLowerCase();

/** Aplikuje zvolené filtry na seznam modelů podle konfigurace. */
export const applyFilters = (
    models: AIModel[],
    filters: ModelFilters
): AIModel[] =>
    models.filter((model) =>
        // Model musí vyhovět všem aktivním filtrům
        MODEL_FILTERS_CONFIG.every((filterConfig) => {
            const selectedValues = filters[filterConfig.key];

            if (selectedValues.length === 0) {
                return true;
            }

            const normalizedSelectedValues = selectedValues.map(
                normalizeFilterValue
            );

            return filterConfig.getValues(model).some((value) =>
                normalizedSelectedValues.includes(normalizeFilterValue(value))
            );
        })
    );
    