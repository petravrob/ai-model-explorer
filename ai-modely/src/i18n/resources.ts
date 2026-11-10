import csCommon from "./locales/cs/common.json";
import csLayout from "./locales/cs/layout.json";
import csModels from "./locales/cs/models.json";
import enCommon from "./locales/en/common.json";
import enLayout from "./locales/en/layout.json";
import enModels from "./locales/en/models.json";

/**
 * Všechny překlady aplikace rozdělené podle jazyka a funkční oblasti:
 * common = sdílené texty, layout = lišta a rozvržení, models = prohlížení modelů.
 * Čeština je výchozí zdroj typů, takže se klíče kontrolují a doplňují podle ní.
 */
export const resources = {
    cs: { common: csCommon, layout: csLayout, models: csModels },
    en: { common: enCommon, layout: enLayout, models: enModels },
} as const;

export const NAMESPACES = ["common", "layout", "models"] as const;
export const DEFAULT_NAMESPACE = "common";
