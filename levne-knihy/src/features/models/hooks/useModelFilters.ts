import { useMemo, useState } from "react";

import { AIModel } from "../types";
import { ModelFilterKey, ModelFilters } from "../modelFiltersConfig";
import { applyFilters, buildEmptyFilters, isAnyFilterActive, toggleFilterValue } from "../utils/modelFilterUtils";

/** Obstarává zvolené předvolby levého panelu a filtrování modelů podle nich */
function useModelFilters(models: AIModel[]) {

    const [filters, setFilters] =
        useState<ModelFilters>(buildEmptyFilters);

    // Přepne zaškrtnutí jedné hodnoty předvolby (zaškrtnutím se přidá, odškrtnutím odebere)
    const handleFilterChange = (
        key: ModelFilterKey,
        value: string
    ): void => {

        setFilters((currentFilters) =>
            toggleFilterValue(currentFilters, key, value)
        );
    };

    const resetFilters = (): void => {

        setFilters(buildEmptyFilters());
    };

    const isFilterActive = isAnyFilterActive(filters);

    const filteredModels: AIModel[] = useMemo(
        () => applyFilters(models, filters),
        [models, filters]
    );

    return {
        filters,

        isFilterActive,

        handleFilterChange,

        resetFilters,

        filteredModels,
    };
}

export default useModelFilters;

