import type { AIModel, ModelInsights } from "../types";
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
        limitations.push(`Licence ${getModelLicense(model.license)} nepovoluje komerční použití.`);
    }

    // Nároky na provoz se odvozují jen tehdy, když je dokumentace nepopisuje
    const hasDocumentedHardware = (insights?.hardwareRequirements?.length ?? 0) > 0;

    if (!hasDocumentedHardware && model.parameters !== null && model.parameters >= LARGE_MODEL_PARAMETERS) {
        limitations.push(`Model má ${formatParameters(model.parameters)} parametrů, takže je náročnější na paměť a hardware.`);
    }

    if ((model.languages?.length ?? 0) === 1) {
        limitations.push(`Dokumentace uvádí jen jazyk ${formatLanguages(model.languages)}, v dalších jazycích může být méně spolehlivý.`);
    }

    return limitations;
};

