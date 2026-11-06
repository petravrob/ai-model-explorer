import type { AIModel, ModelInsights } from "../types";
import { getModelLicense, joinCzech } from "./modelCard";

/**
 * Vlastnosti, které model odlišují od ostatních.
 *
 * Slouží k odpovědi na otázku "proč tento model" a používá se jako záloha,
 * když z dokumentace žádný výčet nedorazil. Bere se jen to, co je doložené
 * (dokumentace, štítky a údaje o modelu) a nic se nedomýšlí ani nehodnotí.
 */

// Kolik vlastností se nejvýš vypíše, aby sekce zůstala krátká
const MAX_HIGHLIGHTS = 4;

// Licence, které umožňují i komerční použití
const PERMISSIVE_LICENSE = /^(mit|apache-2\.0|cc0-1\.0|cc-by-4\.0|bsd-2-clause|bsd-3-clause|mpl-2\.0|unlicense|isc|zlib)$/i;

// Od kolika jazyků se dá mluvit o širokém jazykovém pokrytí
const BROAD_LANGUAGE_COUNT = 10;

// Druhy vstupů a výstupů, které se dají poznat ze štítků a úlohy, když je dokumentace neuvádí
const MODALITY_GROUPS = [
    { pattern: /(vision|image|multimodal|visual|ocr)/i, label: "obrázky" },
    { pattern: /(audio|speech|asr|voice|tts)/i, label: "zvuk" },
    { pattern: /video/i, label: "video" },
];

/** Odvodí z doložených údajů vlastnosti, které model odlišují. */
export const getModelHighlights = (model: AIModel, insights: ModelInsights | null): string[] => {
    const highlights: string[] = [];

    // Druhy vstupů a výstupů: přednost má dokumentace, jinak se poznají ze štítků a úlohy.
    // Samotný text se neuvádí, ten umí každý textový model.
    const fromDocs = (insights?.modalities ?? [])
        .map((item) => item.toLowerCase().trim())
        .filter(Boolean);

    const fromTags = MODALITY_GROUPS
        .filter((group) => group.pattern.test([model.task, ...(model.tags ?? [])].join(" ")))
        .map((group) => group.label);

    const beyondText = [...new Set([...fromDocs, ...fromTags])]
        .filter((item) => !/^text(ov[ýy])?$/i.test(item))
        .slice(0, 3);

    if (beyondText.length > 0) {
        // Když dokumentace uvádí jen tyto druhy, text se nepředpokládá
        const onlyThese = fromDocs.length > 0 && fromDocs.every((item) => beyondText.includes(item));

        highlights.push(onlyThese
            ? `Zvládá ${joinCzech(beyondText)}.`
            : `Kromě textu zvládá i ${joinCzech(beyondText)}.`);
    }

    if (insights?.architecture) {
        highlights.push(`Architektura podle dokumentace: ${insights.architecture}.`);
    }

    if (insights?.trainingMethod) {
        highlights.push(`Způsob tréninku podle dokumentace: ${insights.trainingMethod}.`);
    }

    if (model.license && PERMISSIVE_LICENSE.test(model.license)) {
        highlights.push(`Otevřená licence ${getModelLicense(model.license)} umožňuje i komerční použití.`);
    }

    if (insights?.contextLength) {
        highlights.push(`Zvládne kontext až ${insights.contextLength}.`);
    }

    if ((model.languages?.length ?? 0) >= BROAD_LANGUAGE_COUNT) {
        highlights.push(`Podporuje ${model.languages.length} jazyků.`);
    }

    return highlights.slice(0, MAX_HIGHLIGHTS);
};
