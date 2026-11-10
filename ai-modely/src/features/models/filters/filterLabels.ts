import { translate } from "@/i18n/translate";

import type { FilterOption } from "./filterTypes";

/** Nabídka hodnot filtru s popiskem přeloženým do aktuálního jazyka. */
export interface TranslatedFilterOption extends Omit<FilterOption, "label" | "children"> {
    label: string;
    children?: TranslatedFilterOption[];
}

/**
 * Převede popisky filtrů na text v aktuálním jazyce.
 * Hodnoty bez překladového klíče (značky, knihovny, licence) zůstávají v původní podobě.
 */
export const translateFilterOptions = (options: readonly FilterOption[]): TranslatedFilterOption[] =>
    options.map((option) => ({
        value: option.value,
        labelKey: option.labelKey,
        icon: option.icon,
        label: option.labelKey ? translate(`models:${option.labelKey}`) : option.label ?? option.value,
        children: option.children ? translateFilterOptions(option.children) : undefined,
    }));

