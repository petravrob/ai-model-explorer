import type { AIModel } from "../types";

/**
 * Odvozené údaje pro kartu modelu.
 *
 * Karta nesmí zobrazovat vymyšlené hodnoty, proto se odznak, štítky
 * i popis skládají jen z dat, která model opravdu má.
 */

/** Počet stažení, od kterého se model v kartě označí jako populární. */
const POPULAR_DOWNLOADS = 1_000_000;

/** Počet dní od poslední změny, po který se model v kartě označí jako nový. */
const NEW_MODEL_DAYS = 90;

/** Kolik doplňkových štítků se vejde do karty vedle hlavní úlohy modelu. */
const MAX_SECONDARY_TAGS = 3;

/** Dvojpísmenné štítky jsou kódy jazyků, ty mají v kartě vlastní místo. */
const LANGUAGE_CODE_PATTERN = /^[a-z]{2}$/;

/** Technické štítky z Hugging Face, které o schopnostech modelu nic neříkají. */
const TECHNICAL_TAGS = new Set([
    "transformers", "pytorch", "tensorflow", "tf", "jax", "flax", "onnx", "safetensors", "openvino", "rust",
    "gguf", "ggml", "coreml", "keras", "mlx", "diffusers", "peft", "sentence-transformers", "spacy", "espeak",
    "fastai", "joblib", "tf-keras", "adapters", "text-generation-inference", "text-embeddings-inference",
    "endpoints_compatible", "eval-results", "custom_code", "mergekit", "unsloth", "quantized", "4-bit", "8-bit",
    "fp16", "bf16", "int8", "license", "dataset", "base_model", "arxiv", "region", "deploy",
]);

/** Převede technickou hodnotu ze zdroje na čitelný popisek (např. „text-generation“ na „Text generation“). */
const toLabel = (value: string): string => {

    const label = value.replace(/[-_]/g, " ").trim();

    return label.charAt(0).toUpperCase() + label.slice(1);
};

/** Odznak stavu karty. */
export interface ModelBadge {
    label: string;
    variant: "popular" | "new";
}

/** Štítky karty: hlavní úloha modelu a k ní doplňkové schopnosti. */
export interface ModelTagList {
    // Hlavní úloha modelu (pipeline_tag)
    primary: string | null;
    // Doplňkové schopnosti, které se do karty vejdou
    secondary: string[];
    // Kolik dalších štítků zůstalo mimo kartu
    remaining: number;
}

/** Vybere odznak karty. Když pro něj nejsou data, karta odznak nezobrazí. */
export const getModelBadge = (model: AIModel): ModelBadge | null => {

    if (model.downloads >= POPULAR_DOWNLOADS) {
        return { label: "Populární", variant: "popular" };
    }

    const lastModified = model.lastModified ? new Date(model.lastModified).getTime() : null;

    const isNew = lastModified !== null
        && Date.now() - lastModified < NEW_MODEL_DAYS * 24 * 60 * 60 * 1000;

    return isNew ? { label: "Nový", variant: "new" } : null;
};

/** Sestaví štítky karty: hlavní úlohu modelu a k ní nejvýš tři doplňkové schopnosti. */
export const getModelTagList = (model: AIModel): ModelTagList => {

    const primary = model.task ? toLabel(model.task) : null;
    const secondary: string[] = [];
    let remaining = 0;

    model.tags.forEach((tag) => {

        // Štítky s dvojtečkou nesou technický údaj (licence, dataset), ne schopnost modelu
        if (typeof tag !== "string" || tag.length === 0 || tag.includes(":")) {
            return;
        }

        if (TECHNICAL_TAGS.has(tag.toLowerCase())) {
            return;
        }

        // Jazyky mají v kartě vlastní místo
        if (LANGUAGE_CODE_PATTERN.test(tag) || model.languages.includes(tag.toLowerCase())) {
            return;
        }

        const label = toLabel(tag);

        // Úloha se v řadě štítků neopakuje
        if (label.toLowerCase() === primary?.toLowerCase()) {
            return;
        }

        if (secondary.some((existing) => existing.toLowerCase() === label.toLowerCase())) {
            return;
        }

        if (secondary.length < MAX_SECONDARY_TAGS) {
            secondary.push(label);
        } else {
            remaining += 1;
        }
    });

    return { primary, secondary, remaining };
};

/** Sestaví krátký popis karty. Když zdroj popis neposkytuje, složí se jen z údajů modelu. */
export const getModelSummary = (model: AIModel): string => {

    const description = model.description?.trim();

    if (description) {
        return description;
    }

    const parts = [`Model pro úlohu „${toLabel(model.task)}“`];

    if (model.library) {
        parts.push(`knihovna ${model.library}`);
    }

    if (model.languages.length > 0) {
        // „podpora 1 jazyka“, „podpora 3 jazyků“
        parts.push(`podpora ${model.languages.length} ${model.languages.length === 1 ? "jazyka" : "jazyků"}`);
    }

    return `${parts.join(", ")}.`;
};

