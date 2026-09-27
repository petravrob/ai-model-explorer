import type { FilterCategoryConfig } from "./filterTypes";
import {
    TASK_FILTER_OPTIONS,
    LANGUAGE_FILTER_OPTIONS,
    PARAMETER_FILTER_OPTIONS,
    AUTHOR_FILTER_OPTIONS,
    LIBRARY_FILTER_OPTIONS,
    LICENSE_FILTER_OPTIONS,
} from "./filterOptions";
import { fromModelField, fromParameterCount } from "./filterValueGetters";

/**
 * Konfigurace kategorií filtrů v levém panelu.
 *
 * Každá kategorie umožňuje vybrat jednu či více hodnot a určuje,
 * kolik hodnot se z ní ukáže ve zkrácené nabídce panelu.
 */
export const MODEL_FILTERS_CONFIG = [
    {
        key: "tasks",
        title: "Úloha",
        icon: "M9 11l3 3L22 4M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11",
        visibleValues: 32,
        options: TASK_FILTER_OPTIONS,
        getValues: fromModelField("task"),
    },
    {
        key: "languages",
        title: "Jazyk",
        icon: "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zM2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1 4-10 15.3 15.3 0 0 1 4-10z",
        visibleValues: 8,
        options: LANGUAGE_FILTER_OPTIONS,
        getValues: fromModelField("languages"),
    },
    {
        key: "library",
        title: "Knihovna",
        icon: "M4 19.5V6a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 1.5zM8 4v16M20 17H6",
        visibleValues: 8,
        options: LIBRARY_FILTER_OPTIONS,
        getValues: fromModelField("library"),
    },
    {
        key: "license",
        title: "Licence",
        icon: "M12 3l7 3v6c0 4-3 7.5-7 9-4-1.5-7-5-7-9V6zM9 12l2 2 4-4",
        visibleValues: 8,
        options: LICENSE_FILTER_OPTIONS,
        getValues: fromModelField("license"),
    },
    {
        key: "parameters",
        title: "Velikost modelu",
        icon: "M12 8c4.97 0 9-1.34 9-3s-4.03-3-9-3-9 1.34-9 3 4.03 3 9 3zM21 12c0 1.66-4.03 3-9 3s-9-1.34-9-3M3 5v14c0 1.66 4.03 3 9 3s9-1.34 9-3V5",
        visibleValues: 8,
        options: PARAMETER_FILTER_OPTIONS,
        getValues: fromParameterCount,
    },
    {
        key: "author",
        title: "Autor",
        icon: "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z",
        visibleValues: 8,
        options: AUTHOR_FILTER_OPTIONS,
        getValues: fromModelField("author"),
    },
] as const satisfies readonly FilterCategoryConfig[];

type FilterConfigEntry = (typeof MODEL_FILTERS_CONFIG)[number];

/** Klíče kategorií filtrů odvozené z konfigurace. */
export type ModelFilterKey = FilterConfigEntry["key"];

/**
 * Stav filtrů odvozený z konfigurace. Prázdné pole znamená, že kategorie není aktivní.
 */
export type ModelFilters = Record<ModelFilterKey, string[]>;
