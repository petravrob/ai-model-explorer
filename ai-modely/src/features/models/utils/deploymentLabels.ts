import { translate } from "@/i18n/translate";

/**
 * Popisy způsobů nasazení a nástrojů pro spuštění modelu.
 *
 * Názvy z dokumentace se nemění, popis se doplňuje pouze při vykreslení v UI.
 * U neznámého nástroje nebo služby se použije obecné vysvětlení.
 */

/** Převodní klíč: bez okrajových mezer, malými písmeny, bez interpunkce. */
const toDeploymentKey = (text: string): string =>
    text.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

/** Krátký popis, k čemu daný způsob nasazení slouží. */
export const getDeploymentDescription = (name: string): string =>
    translate(`models:deployment.${toDeploymentKey(name)}`, {
        // Neznámý nástroj nebo služba dostane obecné vysvětlení
        defaultValue: translate("models:deployment.other"),
    });

