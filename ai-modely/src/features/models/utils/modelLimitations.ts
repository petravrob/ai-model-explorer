import type { AIModel, ModelInsights } from "../types";
import { translate } from "@/i18n/translate";
import { formatLanguages, formatParameters } from "./formatters";
import { getModelLicense } from "./modelCard";

/**
 * Praktická omezení odvozená z doložených údajů modelu.
 *
 * Slouží jako záloha pro sekci "Omezení", když z dokumentace žádná omezení
 * nedorazila. Bere se jen to, co je doložené (licence, velikost modelu, jazyky),
 * a nic se nedomýšlí ani nehodnotí.
 */

// Licence, které nepovolují komerční použití (např. cc-by-nc-4.0)
const NON_COMMERCIAL_LICENSE = /(^|-)(nc)(-|$)|non-?commercial/i;

// Od kolika parametrů se dá čekat výraznější nárok na provoz
const LARGE_MODEL_PARAMETERS = 30_000_000_000;

/** Odvodí z doložených údajů praktická omezení modelu. */
export const getModelLimitations = (model: AIModel, insights: ModelInsights | null): string[] => {
    const limitations: string[] = [];

    // Nekomerční licence je pro použití nejdůležitější omezení
    if (model.license && NON_COMMERCIAL_LICENSE.test(model.license)) {
        limitations.push(translate("models:limitations.nonCommercial", { license: getModelLicense(model.license) }));
    }

    // Nároky na provoz se odvozují jen tehdy, když je dokumentace nepopisuje
    const hasDocumentedHardware = (insights?.hardwareRequirements?.length ?? 0) > 0;

    if (!hasDocumentedHardware && model.parameters !== null && model.parameters >= LARGE_MODEL_PARAMETERS) {
        limitations.push(translate("models:limitations.largeModel", { parameters: formatParameters(model.parameters) }));
    }

    if ((model.languages?.length ?? 0) === 1) {
        limitations.push(translate("models:limitations.singleLanguage", { language: formatLanguages(model.languages) }));
    }

    return limitations;
};

