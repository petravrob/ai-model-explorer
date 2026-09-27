import type { AIModel, ModelInsights } from "../types";
import { joinCzech } from "./modelCard";

/**
 * Vlastnosti, které model odlišují od ostatních.
 *
 * Slouží k odpovědi na otázku "proč tento model". Bere se jen to, co dokumentace
 * skutečně uvádí, a záměrně se neopakují údaje, které mají vlastní sekci
 * (technické údaje, nasazení, výkon i omezení).
 * Nic se nedomýšlí a nic se nehodnotí.
 */

// Kolik vlastností se nejvýš vypíše, aby sekce zůstala krátká
const MAX_HIGHLIGHTS = 4;

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

    if (insights?.trainingMethod) {
        highlights.push(`Způsob tréninku podle dokumentace: ${insights.trainingMethod}.`);
    }

    return highlights.slice(0, MAX_HIGHLIGHTS);
};
