import { MISSING_VALUE } from "@/ui";
import type { AIModel } from "../types";
import { AUTHOR_FILTER_OPTIONS, TASK_FILTER_OPTIONS } from "../filters/filterOptions";

/** Odvozené údaje pro kartu modelu. */

// Čitelné názvy poskytovatelů
const PROVIDER_LABELS = new Map(
    AUTHOR_FILTER_OPTIONS.map((option) => [option.value.toLowerCase(), option.label] as const)
);

// Čitelné názvy úloh
const TASK_LABELS = new Map<string, string>();
const TASK_GROUPS = new Map<string, string>();
const taskLabelGroups = new Map<string, Set<string>>();

TASK_FILTER_OPTIONS.forEach((group) => {
    group.children.forEach((task) => {
        TASK_LABELS.set(task.value, task.label);
        TASK_GROUPS.set(task.value, group.label);

        taskLabelGroups.set(
            task.label,
            (taskLabelGroups.get(task.label) ?? new Set()).add(group.label)
        );
    });
});

// Názvy skupin v druhém pádu
const GROUP_GENITIVES = new Map<string, string>([
    ["text", "textu"],
    ["obrázky", "obrázků"],
    ["zvuk a řeč", "zvuku a řeči"],
    ["video", "videa"],
    ["dokumenty", "dokumentů"],
    ["vyhledávání a podobnost", "vyhledávání a podobnosti"],
    ["data a predikce", "dat a predikcí"],
    ["robotika", "robotiky"],
    ["ostatní", "ostatních"],
]);

const MAX_SECONDARY_TAGS = 6;

/**
 * České názvy štítků, které nabídka filtrů nezná.
 * Neznámé štítky se do karty nepřidávají.
 */
const TAG_LABELS = new Map<string, string>([
    // Úlohy
    ["text2text-generation", "Převod a generování textu"],
    ["unconditional-image-generation", "Generování obrázků bez zadání"],
    ["fill-mask", "Doplňování chybějících slov"],
    ["zero-shot-classification", "Klasifikace bez předchozích příkladů"],
    ["multiple-choice", "Řešení otázek s výběrem odpovědi"],
    ["zero-shot-image-classification", "Rozpoznávání obrázků bez předchozích příkladů"],
    ["depth-estimation", "Odhad hloubky v obraze"],
    ["mask-generation", "Vytváření obrazových masek"],

    // Schopnosti a oblasti použití
    ["conversational", "Konverzace"],
    ["reasoning", "Logické uvažování a řešení problémů"],
    ["code", "Práce s programovacím kódem"],
    ["coding", "Programování a práce s kódem"],
    ["math", "Matematické úlohy"],
    ["chat", "Chat a dialog"],
    ["moe", "Směs specializovaných expertů"],
    ["vision", "Porozumění obrazovým datům"],
    ["multimodal", "Práce s více typy dat"],
    ["multilingual", "Práce ve více jazycích"],
    ["long-context", "Práce s dlouhým kontextem"],
    ["tool-calling", "Používání externích nástrojů"],
    ["function-calling", "Volání funkcí"],
    ["instruction-following", "Dodržování pokynů"],
    ["agents", "AI agenti"],
    ["rag", "Vyhledávání informací a práce se znalostmi (RAG)"],
    ["ocr", "Rozpoznávání textu z obrázků (OCR)"],
    ["embeddings", "Převod dat na vektorové reprezentace"],
    ["embedding", "Vektorové reprezentace dat"],
    ["zero-shot", "Použití bez předchozích příkladů"],
    ["distillation", "Přenos znalostí do menšího modelu"],
    ["speculative-decoding", "Zrychlené generování pomocí predikce"],
    ["uncensored", "Model bez dodatečných obsahových omezení"],

    // Obrázky
    ["image-generation", "Generování obrázků"],
    ["diffusion", "Difuzní generování"],
    ["lora", "Efektivní přizpůsobení modelu (LoRA)"],
    ["controlnet", "Řízení generování obrázků (ControlNet)"],
    ["stable-diffusion", "Stable Diffusion"],
    ["stable-diffusion-xl", "Stable Diffusion XL"],
    ["sdxl", "Stable Diffusion XL"],
    ["flux", "FLUX"],
    ["inpainting", "Úprava a doplňování částí obrázku"],
    ["style-transfer", "Přenos výtvarného stylu"],
    ["upscaling", "Zvýšení rozlišení obrázku"],
    ["photorealistic", "Fotorealistické obrázky"],
    ["photography", "Fotografické obrázky"],
    ["cinematic", "Filmový vzhled"],
    ["portrait", "Portréty"],
    ["realistic", "Realistický vzhled"],
    ["illustration", "Ilustrace"],
    ["anime", "Anime styl"],
    ["art", "Umělecká tvorba"],
    ["artistic", "Umělecký styl"],

    // Zvuk a řeč
    ["audio", "Zvuk"],
    ["speech", "Řeč"],
    ["voice", "Hlas"],
    ["tts", "Převod textu na řeč"],
    ["asr", "Převod řeči na text"],
    ["speech-synthesis", "Syntéza řeči z textu"],
    ["speech-generation", "Generování řeči"],
    ["speech-to-text", "Přepis řeči na text"],
    ["voice-cloning", "Klonování hlasu"],
    ["voice-clone", "Klonování hlasu"],
    ["voice-conversion", "Převod jednoho hlasu na jiný"],
    ["voice-design", "Tvorba a úprava hlasu"],
    ["voice-agent", "Hlasový AI agent"],
    ["speaker", "Mluvčí"],
    ["speaker-diarization", "Rozlišení jednotlivých mluvčích"],
    ["speaker-recognition", "Rozpoznávání mluvčích"],
    ["speaker-verification", "Ověření identity mluvčího"],
    ["speaker-identification", "Identifikace mluvčího"],
    ["speaker-change-detection", "Rozpoznávání změn mluvčích"],
    ["source-separation", "Oddělení jednotlivých zvukových zdrojů"],
    ["emotion", "Rozpoznávání emocí"],
    ["emotions", "Rozpoznávání emocí"],
    ["emotion-control", "Ovládání emocí v řeči"],
    ["expressive-speech", "Expresivní a emocionální řeč"],
    ["forced-alignment", "Časové zarovnání řeči a textu"],
    ["whisper", "Whisper"],
    ["wav2vec2", "wav2vec 2.0"],
    ["streaming", "Zpracování v reálném čase"],
    ["low-latency", "Nízká odezva"],
    ["realtime", "Zpracování v reálném čase"],

    // Kvantizace a lokální běh
    ["gguf", "Lokální běh (GGUF)"],
    ["on-device", "Běh přímo v zařízení"],
    ["4-bit", "Menší nároky na paměť"],
    ["8-bit", "Menší nároky na paměť"],
    ["2-bit", "Menší nároky na paměť"],
    ["fp8", "Menší nároky na paměť"],
    ["awq", "Menší nároky na paměť"],
    ["ternary", "Menší nároky na paměť"],
    ["imatrix", "Menší nároky na paměť"],
    ["compressed-tensors", "Menší nároky na paměť"],
    ["apple-silicon", "Optimalizováno pro Apple Silicon"],
    ["cuda", "Zrychlení na grafické kartě"],
    ["metal", "Zrychlení na grafické kartě"],

    // Nástroje a prostředí
    ["comfyui", "ComfyUI"],
    ["llama.cpp", "llama.cpp"],
    ["unsloth", "Unsloth"],
    ["pyannote", "pyannote"],
    ["pyannote-audio", "pyannote"],
    ["pyannote-audio-pipeline", "pyannote"],

    // Další schopnosti
    ["vision-language", "Porozumění obrázkům a textu"],
    ["text-to-audio", "Generování zvuku"],
    ["voice-activity-detection", "Detekce řeči v nahrávce"],
    ["agentic", "Agentní postupy"],
    ["abliterated", "Model bez dodatečných obsahových omezení"],
    ["image-editing", "Úprava obrázků"],
    ["creative-writing", "Kreativní psaní"],
    ["stable-diffusion-diffusers", "Stable Diffusion"],
    ["causal-lm", "Jazykový model"],

    // Známé rodiny a architektury
    ["bert", "BERT"],
    ["distilbert", "DistilBERT"],
    ["roberta", "RoBERTa"],
    ["xlm-roberta", "XLM-RoBERTa"],
    ["electra", "ELECTRA"],
    ["t5", "T5"],
    ["clip", "CLIP"],
    ["vit", "ViT"],
    ["yolo", "YOLO"],
    ["sam", "SAM"],
    ["llama", "Llama"],
    ["mistral", "Mistral"],
    ["gemma", "Gemma"],
    ["phi", "Phi"],
    ["qwen", "Qwen"],
    ["deepseek", "DeepSeek"],
    ["granite", "Granite"],
    ["hubert", "HuBERT"],
    ["mms", "MMS"],
    ["kokoro", "Kokoro"],
    ["piper", "Piper"],
    ["gpt2", "GPT-2"],
    ["gpt_neox", "GPT-NeoX"],
    ["opt", "OPT"],
    ["pythia", "Pythia"],
    ["coqui", "Coqui"],
    ["qwen2", "Qwen"],
    ["qwen3", "Qwen"],
    ["qwen3.8", "Qwen"],
    ["qwen3_5", "Qwen"],
    ["qwen3_5_moe", "Qwen"],
    ["gemma2", "Gemma"],
    ["gemma3", "Gemma"],
    ["gemma4", "Gemma"],
]);

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
    ["other", "jiná"],
]);

/** Převede technickou hodnotu na čitelný popisek. */
const toLabel = (value: string): string => {
    const label = value.replace(/[-_]/g, " ").trim();

    return label.charAt(0).toUpperCase() + label.slice(1);
};

/** Najde český název štítku. */
const toTagLabel = (tag: string): string | null => {
    const value = tag.toLowerCase();
    const taskLabel = TASK_LABELS.get(value);

    if (!taskLabel) {
        return TAG_LABELS.get(value) ?? null;
    }

    const needsGroup = (taskLabelGroups.get(taskLabel)?.size ?? 0) > 1;

    if (!needsGroup) {
        return toLabel(taskLabel);
    }

    const group = TASK_GROUPS.get(value) ?? "";

    return toLabel(`${taskLabel} ${GROUP_GENITIVES.get(group) ?? group}`);
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
export const getModelLicense = (license: string | null): string =>
    license ? (LICENSE_LABELS.get(license.toLowerCase()) ?? license) : MISSING_VALUE;

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

/** Převede běžný popisek na malé písmeno pro použití uprostřed věty. */
const toSentenceCase = (label: string): string =>
    isProperName(label)
        ? label
        : label.charAt(0).toLowerCase() + label.slice(1);

/** Spojí několik popisků českou spojkou. */
const joinCzech = (items: string[]): string =>
    items.length < 2
        ? (items[0] ?? "")
        : `${items.slice(0, -1).join(", ")} a ${items[items.length - 1]}`;

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
        return "AI model dostupný prostřednictvím Hugging Face.";
    }

    // Úloha a schopnosti se vypíšou (Generování textu a konverzace).
    // Když úloha obsahuje "a" (např. Obrázek a text), oddělí se zbytek čárkou.
    const joined = parts[0].includes(" a ") ? parts.join(", ") : joinCzech(parts);

    return `${joined}.`;
};
