import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";

import { AIModel } from "../types";
import { ModelFilterKey, ModelFilters } from "../filters";
import { applyFilters, buildEmptyFilters, countSelectedFilterValues, isAnyFilterActive, toggleFilterValue } from "../utils/modelFilterUtils";
import { buildFiltersParamsKey, readFiltersFromParams, writeFiltersToParams } from "../utils/modelListParams";

/** Obstarává zvolené filtry levého panelu a filtrování modelů podle nich */
function useModelFilters(models: AIModel[]) {

    // Zvolené filtry jsou v URL, aby zůstaly nastavené i po návratu z detailu modelu
    const [searchParams, setSearchParams] = useSearchParams();

    const filters = useMemo(
        () => readFiltersFromParams(searchParams),
        // Závislost na klíči filtrů je záměrná: searchParams se mění i s hledaným výrazem,
        // ten ale zvolené filtry nemění, a proto se filtry nemají přepočítávat při každém psaní
        [buildFiltersParamsKey(searchParams)]
    );

    /** Zapíše nově zvolené filtry do URL. */
    const updateFilters = (
        updateSelection: (currentFilters: ModelFilters) => ModelFilters
    ): void => {

        setSearchParams(
            (currentParams) => {

                const params = new URLSearchParams(currentParams);

                // Filtry se přečtou z aktuálních parametrů, aby se rychlé změny navzájem nepřepsaly
                writeFiltersToParams(params, updateSelection(readFiltersFromParams(currentParams)));

                return params;
            },
            // Nahrazením se historie nezaplní každým zaškrtnutím filtru
            { replace: true }
        );
    };

    // Přepne zaškrtnutí jedné hodnoty filtru (zaškrtnutím se přidá, odškrtnutím odebere)
    const handleFilterChange = (
        key: ModelFilterKey,
        value: string
    ): void => {

        updateFilters((currentFilters) =>
            toggleFilterValue(currentFilters, key, value)
        );
    };

    const resetFilters = (): void => {

        updateFilters(() => buildEmptyFilters());
    };

    const isFilterActive = isAnyFilterActive(filters);

    const activeFilterCount = countSelectedFilterValues(filters);

    const filteredModels: AIModel[] = useMemo(
        () => applyFilters(models, filters),
        [models, filters]
    );

    return {
        filters,

        isFilterActive,

        activeFilterCount,

        handleFilterChange,

        resetFilters,

        filteredModels,
    };
}

export default useModelFilters;

