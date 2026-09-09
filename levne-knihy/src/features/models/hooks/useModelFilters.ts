import { useMemo, useState } from "react";

import { AIModel, ModelFilters, ModelFilterOptions } from "../types";

/** Prázdné předvolby, které výpis modelů nijak nezúží. */
const EMPTY_FILTERS: ModelFilters = {
    tasks: [],
};

/** Sbírá unikátní a abecedně seřazené hodnoty jedné vlastnosti modelů. */
const collectUniqueValues = (
    models: AIModel[],
    getValue: (model: AIModel) => string | null
): string[] => {

    const values = new Set<string>();

    models.forEach((model) => {

        const value = getValue(model);

        if (value) {
            values.add(value);
        }
    });

    return [...values].sort((first, second) => first.localeCompare(second, "cs"));
};

/** Určí, zda je nastavena alespoň jedna předvolba. */
const isAnyFilterActive = (filters: ModelFilters): boolean =>
    Object.values(filters).some((value) => value.length > 0);

/** Aplikuje zvolené předvolby na seznam modelů. */
const filterModels = (models: AIModel[], filters: ModelFilters): AIModel[] => {

    return models.filter((model) => {

        // Prázdný seznam úloh znamená, že se filtr úloh nepoužije
        if (filters.tasks.length > 0 && !filters.tasks.includes(model.task)) {
            return false;
        }

        return true;
    });
};

/** Obstarává levý panel předvoleb, jejich nabídku a filtrování modelů podle nich */
function useModelFilters(models: AIModel[]) {

    const [filters, setFilters] =
        useState<ModelFilters>(EMPTY_FILTERS);

    // Nabídka hodnot předvoleb se odvodí z načtených modelů
    const filterOptions: ModelFilterOptions = useMemo(
        () => ({
            tasks: collectUniqueValues(models, (model) => model.task),
        }),
        [models]
    );

    // Přepne zaškrtnutí jedné hodnoty předvolby (zaškrtnutím se přidá, odškrtnutím odebere)
    const handleFilterChange = (
        name: keyof ModelFilters,
        value: string
    ): void => {

        setFilters((currentFilters) => {

            const selectedValues = currentFilters[name];

            const newValues = selectedValues.includes(value)
                ? selectedValues.filter((selected) => selected !== value)
                : [...selectedValues, value];

            return {
                ...currentFilters,
                [name]: newValues,
            };
        });
    };

    const resetFilters = (): void => {

        setFilters(EMPTY_FILTERS);
    };

    const isFilterActive = isAnyFilterActive(filters);

    const filteredModels: AIModel[] = useMemo(
        () => filterModels(models, filters),
        [models, filters]
    );

    return {
        filters,

        filterOptions,

        isFilterActive,

        handleFilterChange,

        resetFilters,

        filteredModels,
    };
}

export default useModelFilters;