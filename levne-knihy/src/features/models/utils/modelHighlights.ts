import type { AIModel, ModelInsights } from "../types";
import { getModelTagList, joinCzech, toSentenceCase } from "./modelCard";

/**
 * Zajímavosti, které se dají odvodit z údajů o modelu a z jeho dokumentace.
 *
 * Slouží k odpovědi na otázku „proč by mohl být tento model zajímavý“.
 * Nic se nedomýšlí: co v datech není, se prostě vynechá, a nic se nehodnotí
 * ani nesrovnává s jinými modely.
 */

// Kolik vět se nejvýš vypíše, aby sekce zůstala krátká
const MAX_HIGHLIGHTS = 6;

// Kolik oblastí a benchmarků se ve větách vyjmenuje
const MAX_AREAS = 3;
const MAX_BENCHMARKS = 4;

// Druhy vstupů, které se dají poznat ze štítků a popisků dokumentace
const MODALITY_GROUPS = [
    { pattern: /(vision|image|multimodal|visual|ocr)/i, label: "obrázky" },
    { pattern: /(audio|speech|asr|voice|tts)/i, label: "zvuk" },
    { pattern: /video/i, label: "video" },
];

/** Odvodí z dostupných údajů několik faktických vět o modelu. */
export const getModelHighlights = (model: AIModel, insights: ModelInsights | null): string[] => {
    const highlights: string[] = [];
    const tags = getModelTagList(model);

    const areas = [...new Set([
        ...(insights?.bestFor ?? []),
        ...(insights?.capabilities ?? []),
        tags.primary ?? "",
    ].filter(Boolean))].slice(0, MAX_AREAS);

    if (areas.length > 0) {
        highlights.push(`Zaměření: ${joinCzech(areas.map(toSentenceCase))}.`);
    }

    // Druhy vstupů se hledají ve štítcích i v popiscích z dokumentace
    const description = [
        model.task,
        ...(model.tags ?? []),
        ...(insights?.bestFor ?? []),
        ...(insights?.capabilities ?? []),
    ].join(" ");

    const modalities = MODALITY_GROUPS
        .filter((group) => group.pattern.test(description))
        .map((group) => group.label);

    if (modalities.length > 0) {
        highlights.push(`Zvládá kromě textu i ${joinCzech(modalities)}.`);
    }

    if (insights?.contextLength) {
        const unit = /token|znak/i.test(insights.contextLength) ? "" : " tokenů";

        highlights.push(`Dokumentovaná délka kontextu: ${insights.contextLength}${unit}.`);
    }

    const frameworks = insights?.inferenceFrameworks ?? [];

    if (frameworks.length > 0) {
        highlights.push(`Uvedené možnosti spuštění: ${joinCzech(frameworks)}.`);
    }

    const benchmarks = insights?.benchmarks ?? [];

    if (benchmarks.length > 0) {
        const names = [...new Set(benchmarks.map((item) => item.name))].slice(0, MAX_BENCHMARKS);
        const total = benchmarks.length > names.length ? ` (celkem ${benchmarks.length})` : "";

        highlights.push(`Dokumentované výsledky: ${names.join(", ")}${total}.`);
    }

    const limitations = insights?.limitations ?? [];

    if (limitations.length > 0) {
        const text = limitations.length === 1 ? "jedno omezení" : `${limitations.length} omezení`;

        highlights.push(`Dokumentace uvádí ${text}.`);
    }

    return highlights.slice(0, MAX_HIGHLIGHTS);
};
