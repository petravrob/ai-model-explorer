import { AIModel } from "../types";
import { ModelFilterKey, ModelFilters, MODEL_FILTERS_CONFIG } from "../modelFiltersConfig";

/** Sestaví prázdný výběr všech předvoleb podle konfigurace (výpis modelů nijak nezúží). */
export const buildEmptyFilters = (): ModelFilters =>

    MODEL_FILTERS_CONFIG.reduce<ModelFilters>(
        (emptyFilters, filterConfig) => ({
            ...emptyFilters,
            [filterConfig.key]: [],
        }),
        {} as ModelFilters
    );

/** Určí, zda je nastavena alespoň jedna předvolba. */
export const isAnyFilterActive = (filters: ModelFilters): boolean =>
    Object.values(filters).some((selection) => selection.length > 0);

/** Přepne výběr jedné hodnoty předvolby (zaškrtnutí hodnotu přidá, odškrtnutí odebere). */
export const toggleFilterValue = (
    filters: ModelFilters,
    key: ModelFilterKey,
    value: string
): ModelFilters => {

    const selectedValues = filters[key];

    const newValues = selectedValues.includes(value)
        ? selectedValues.filter((selected) => selected !== value)
        : [...selectedValues, value];

    return {
        ...filters,
        [key]: newValues,
    };
};

/** Aplikuje zvolené předvolby na seznam modelů podle konfigurace. */
export const applyFilters = (
    models: AIModel[],
    filters: ModelFilters
): AIModel[] =>

    models.filter((model) =>

        // Model musí vyhovět všem aktivním předvolbám (prázdný výběr výpis nezužuje)
        MODEL_FILTERS_CONFIG.every((filterConfig) => {

            const selectedValues = filters[filterConfig.key];

            if (selectedValues.length === 0) {
                return true;
            }

            return filterConfig.getValues(model)
                .some((value) => selectedValues.includes(value));
        })
    );

