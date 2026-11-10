import type { AIModel } from "../types";
import { AUTHOR_FILTER_OPTIONS, TASK_FILTER_OPTIONS } from "../filters/filterOptions";
import { translate } from "@/i18n/translate";

import { getIntlLocale } from "./formatters";

/** Odvozené údaje pro kartu modelu. */

// Čitelné názvy poskytovatelů
const PROVIDER_LABELS = new Map(
    AUTHOR_FILTER_OPTIONS.map((option) => [option.value.toLowerCase(), option.label] as const)
);

// Skupina úlohy podle její hodnoty (na jazyce nezávisí)
const TASK_GROUPS = new Map<string, string>();

TASK_FILTER_OPTIONS.forEach((group) => {
    group.children.forEach((task) => TASK_GROUPS.set(task.value, group.value));
});

/**
 * Popisky úloh se mezi skupinami opakují (např. "generování"), proto se u nich
 * doplňuje druhý pád skupiny. Mapy se sestavují pro aktuální jazyk a drží v paměti.
 */
type TaskLabelGroups = Map<string, Set<string>>;

let taskLabelGroupsCache: { locale: string; groups: TaskLabelGroups } | null = null;

const getTaskLabelGroups = (): TaskLabelGroups => {
    const locale = getIntlLocale();

    if (taskLabelGroupsCache?.locale === locale) {
        return taskLabelGroupsCache.groups;
    }

    const groups: TaskLabelGroups = new Map();

    TASK_FILTER_OPTIONS.forEach((group) => {
        group.children.forEach((task) => {
            const label = translate(`models:tasks.${group.value}.options.${task.value}`);

            groups.set(label, (groups.get(label) ?? new Set()).add(group.value));
        });
    });

    taskLabelGroupsCache = { locale, groups };

    return groups;
};

const MAX_SECONDARY_TAGS = 6;

// Běžné licence
const LICENSE_LABELS = new Map<string, string>([
    ["mit", "MIT"],
    ["apache-2.0", "Apache 2.0"],
    ["cc0-1.0", "CC0 1.0"],
    ["cc-by-4.0", "CC BY 4.0"],
    ["cc-by-sa-4.0", "CC BY-SA 4.0"],
    ["cc-by-nc-4.0", "CC BY-NC 4.0"],
    ["cc-by-nc-sa-4.0", "CC BY-NC-SA 4.0"],
    ["gpl-2.0", "GPL 2.0"],
    ["gpl-3.0", "GPL 3.0"],
    ["lgpl-3.0", "LGPL 3.0"],
    ["agpl-3.0", "AGPL 3.0"],
    ["bsd-2-clause", "BSD 2-Clause"],
    ["bsd-3-clause", "BSD 3-Clause"],
    ["mpl-2.0", "MPL 2.0"],
    ["unlicense", "Unlicense"],
    ["openrail", "OpenRAIL"],
    ["openrail++", "OpenRAIL++"],
    ["creativeml-openrail-m", "CreativeML OpenRAIL-M"],
    ["llama2", "Llama 2"],
    ["llama3", "Llama 3"],
    ["llama3.1", "Llama 3.1"],
    ["gemma", "Gemma"],
]);

/** Převede technickou hodnotu na čitelný popisek. */
const toLabel = (value: string): string => {
    const label = value.replace(/[-_]/g, " ").trim();

    return label.charAt(0).toUpperCase() + label.slice(1);
};

/** Klíč štítku v překladech: malá písmena, vše kromě písmen a číslic jako pomlčka. */
const toTagKey = (value: string): string =>
    value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

/** Najde název štítku v aktuálním jazyce (neznámý štítek se na kartu nepřidá). */
const toTagLabel = (tag: string): string | null => {
    const value = tag.toLowerCase();
    const group = TASK_GROUPS.get(value);

    if (group) {
        const taskLabel = translate(`models:tasks.${group}.options.${value}`);

        // Stejný popisek ve více skupinách se rozliší druhým pádem skupiny
        const needsGroup = (getTaskLabelGroups().get(taskLabel)?.size ?? 0) > 1;

        if (!needsGroup) {
            return toLabel(taskLabel);
        }

        const genitive = translate(`models:tasks.${group}.genitive`);

        return toLabel(`${taskLabel} ${genitive}`);
    }

    // Štítky mimo nabídku filtrů mají vlastní překlad, neznámé se vynechají
    const label = translate(`models:tags.${toTagKey(value)}`, { defaultValue: "" });

    return label || null;
};

export interface ModelTagList {
    primary: string | null;
    secondary: string[];
    remaining: number;
}

/** Čitelný název poskytovatele modelu. */
export const getModelProvider = (author: string): string =>
    PROVIDER_LABELS.get(author.toLowerCase()) ?? author;

/** Čitelný název licence. */
export const getModelLicense = (license: string | null): string => {
    if (!license) {
        return translate("common:missingValue");
    }

    const value = license.toLowerCase();

    return value === "other"
        ? translate("models:license.other")
        : (LICENSE_LABELS.get(value) ?? license);
};

/** Poskládá štítky karty z hlavní úlohy a doplňkových štítků. */
export const getModelTagList = (model: AIModel): ModelTagList => {
    const primary = model.task
        ? (toTagLabel(model.task) ?? toLabel(model.task))
        : null;

    const secondary: string[] = [];
    let remaining = 0;

    model.tags?.forEach((tag) => {
        const label = typeof tag === "string" ? toTagLabel(tag) : null;

        if (!label || label.toLowerCase() === primary?.toLowerCase()) {
            return;
        }

        // Pokud existuje konkrétnější štítek, obecnější nahradíme.
        const generalIndex = secondary.findIndex(
            (existing) => label.includes(existing)
        );

        if (generalIndex >= 0) {
            secondary[generalIndex] = label;
            return;
        }

        if (secondary.some((existing) => existing.includes(label))) {
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

// Názvy modelů a nástrojů, které mají zůstat s velkým písmenem.
const KEEP_CAPITALIZED = new Set([
    "qwen",
    "llama",
    "mistral",
    "gemma",
    "phi",
    "deepseek",
    "granite",
    "kokoro",
    "piper",
    "pythia",
    "coqui",
    "whisper",
    "bert",
    "roberta",
    "xlm-roberta",
    "distilbert",
    "electra",
    "t5",
    "clip",
    "vit",
    "hubert",
    "sam",
    "yolo",
    "mms",
    "opt",
    "unsloth",
    "comfyui",
    "stable",
    "flux",
    "llama.cpp",
    "pyannote",
    "whisperkit",
    "wav2vec",
]);

/** Určí, zda jde o vlastní název modelu nebo nástroje. */
const isProperName = (label: string): boolean => {
    const [firstWord] = label.split(" ");

    return (
        KEEP_CAPITALIZED.has(firstWord.toLowerCase()) ||
        /[A-Z0-9]/.test(firstWord.slice(1))
    );
};

/** Pozná, zda jde o název modelu samotného (používá se u variant a odvozených modelů). */
export const isModelItself = (model: AIModel, value: string): boolean => {
    const normalize = (text: string): string => text.toLowerCase().replace(/[^a-z0-9]/g, "");

    const names = [
        model.modelId,
        model.modelId.split("/").pop() ?? "",
        model.name,
    ].map(normalize);

    return names.includes(normalize(value));
};

/** Převede běžný popisek na malé písmeno pro použití uprostřed věty. */
export const toSentenceCase = (label: string): string =>
    isProperName(label)
        ? label
        : label.charAt(0).toLowerCase() + label.slice(1);

/** Spojí několik popisků spojkou podle aktuálního jazyka (česky "a", anglicky "and"). */
export const joinList = (items: string[]): string => 
    new Intl.ListFormat(getIntlLocale(), { style: "long", type: "conjunction" }).format(items);

/**
 * Vrátí popis modelu.
 *
 * Pokud existuje AI generovanýpopis, použije se přímo.
 * Fallback pouze stručně shrne dostupnou úlohu a štítky.
 */
export const getModelSummary = (model: AIModel): string => {
    const description = model.description?.trim();

    if (description) {
        return description;
    }

    const tags = getModelTagList(model);
    const capabilities = tags.secondary
        .filter((tag) => !isProperName(tag))
        .slice(0, 3)
        .map(toSentenceCase);

    const parts = [tags.primary, ...capabilities].filter(Boolean) as string[];

    if (parts.length === 0) {
        return translate("models:summary.fallback");
    }

    // Úloha a schopnosti se vypíšou (Generování textu a konverzace).
    // Když úloha obsahuje "a" (např. Obrázek a text), oddělí se zbytek čárkou.
    const joined = parts[0].includes(" a ") ? parts.join(", ") : joinList(parts);

    return `${joined}.`;
};

// Kolik znaků popisu se nejvýš ukáže na kartě (zbytek textu čeká v detailu modelu)
const CARD_PREVIEW_LENGTH = 240;

/**
 * Vrátí úryvek popisu pro kartu modelu.
 *
 * Popis má víc odstavců, na kartě se ale ukazuje jen jeho začátek
 */
export const getModelCardPreview = (model: AIModel): string => {
    const summary = getModelSummary(model).replace(/\s+/g, " ").trim();

    if (summary.length <= CARD_PREVIEW_LENGTH) {
        return summary;
    }

    return `${summary.slice(0, CARD_PREVIEW_LENGTH).replace(/\s+\S*$/, "").trim()}…`;
};
