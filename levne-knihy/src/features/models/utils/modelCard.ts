import type { AIModel } from "../types";
import { AUTHOR_FILTER_OPTIONS, TASK_FILTER_OPTIONS } from "../filters/filterOptions";
import { formatDate, formatParameters } from "./formatters";

/** Odvozené údaje pro kartu modelu, složené z dat, která o sobě model poskytuje. */

// Autoři z nabídky filtrů mají v kartě čitelný název poskytovatele (Meta, OpenAI…)
const PROVIDER_LABELS = new Map(
    AUTHOR_FILTER_OPTIONS.map((option) => [option.value.toLowerCase(), option.label] as const)
);

// Názvy úloh se berou z nabídky filtrů
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

// Názvy skupin v druhém pádě, aby se daly spojit s popiskem úlohy
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

// Kolik doplňkových štítků se vejde do karty vedle úlohy
const MAX_SECONDARY_TAGS = 4;

/*
 * České názvy štítků, které nabídka filtrů nezná.
 * Ostatní štítky bez českého názvu se do karty neposílají,
 * aby v ní nezůstávala nesrozumitelná anglická slova.
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

    // Známé rodiny a architektury modelů
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

// Běžné licence se v kartě zobrazují v obvyklé podobě
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

/** Převede technickou hodnotu ze zdroje na čitelný popisek. */
const toLabel = (value: string): string => {
    const label = value.replace(/[-_]/g, " ").trim();

    return label.charAt(0).toUpperCase() + label.slice(1);
};

/** Najde český název štítku. Neznámý štítek vrátí null. */
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

/** Údaje pro řadu štítků v kartě. */
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
    license ? (LICENSE_LABELS.get(license.toLowerCase()) ?? license) : "—";

/** Poskládá štítky karty z úlohy modelu a několika doplňkových štítků. */
export const getModelTagList = (model: AIModel): ModelTagList => {
    const primary = model.task
        ? (toTagLabel(model.task) ?? toLabel(model.task))
        : null;

    const secondary: string[] = [];
    let remaining = 0;

    model.tags?.forEach((tag) => {
        const label = typeof tag === "string" ? toTagLabel(tag) : null;

        if (label === null || label.toLowerCase() === primary?.toLowerCase()) {
            return;
        }

        // Pokud už máme obecnější štítek a nový je konkrétnější,
        // nahradíme obecný konkrétnějším.
        const generalIndex = secondary.findIndex(
            (existing) => label.includes(existing)
        );

        if (generalIndex >= 0) {
            secondary[generalIndex] = label;
            return;
        }

        // Pokud už máme konkrétnější variantu, obecnější nepřidáváme.
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

// Licence, které obecně umožňují komerční použití.
const PERMISSIVE_LICENCES = new Set([
    "mit",
    "apache-2.0",
    "cc0-1.0",
    "unlicense",
    "bsd-2-clause",
    "bsd-3-clause",
    "mpl-2.0",
    "gpl-2.0",
    "gpl-3.0",
    "lgpl-3.0",
    "agpl-3.0",
]);

const NON_COMMERCIAL_LICENCES = new Set([
    "cc-by-nc-4.0",
    "cc-by-nc-sa-4.0",
    "cc-by-nc-3.0",
    "cc-by-nc-sa-3.0",
]);

/**
 * Popis modelu do karty.
 *
 * Pokud má model uložený AI-generovaný popis, použije se přímo.
 * Fallback se používá pouze u modelů bez popisu, stručně popíše model
 */
export const getModelSummary = (model: AIModel): string => {
    const description = model.description?.trim();

    if (description) {
        return description;
    }

    const sentences: string[] = [];
    const tags = getModelTagList(model);

    const license = model.license?.toLowerCase() ?? "";

    // Hlavní účel modelu
    if (tags.primary) {
        sentences.push(`Určený pro ${toSentenceCase(tags.primary)}.`);
    }

    // Doplňkové schopnosti pouze pokud dávají smysluplnou informaci.
    const capabilities = tags.secondary
        .filter((tag) => !isProperName(tag))
        .slice(0, 2)
        .map(toSentenceCase);

    if (capabilities.length > 0 && sentences.length < 2) {
        sentences.push(`Podporuje ${joinCzech(capabilities)}.`);
    }

    // Pokud nemáme žádné použitelné štítky, použijeme technické údaje.
    if (sentences.length === 0 && model.parameters) {
        sentences.push(`Model má ${formatParameters(model.parameters)} parametrů.`);
    }

    if (sentences.length < 2 && model.languages?.length) {
        const count = model.languages.length;

        sentences.push(
            count === 1
                ? "Je určen pro jeden jazyk."
                : `Pracuje s ${count} jazyky.`
        );
    }

    if (sentences.length < 2 && model.library) {
        sentences.push(`Je postavený na knihovně ${model.library}.`);
    }

    if (sentences.length < 2 && NON_COMMERCIAL_LICENCES.has(license)) {
        sentences.push("Licence umožňuje pouze nekomerční použití.");
    }

    if (sentences.length < 2 && PERMISSIVE_LICENCES.has(license)) {
        sentences.push("Používá otevřenou licenci.");
    }

    // Poslední záchrana – karta musí vždy obsahovat nějaký popis.
    if (sentences.length === 0) {
        sentences.push("AI model dostupný prostřednictvím Hugging Face.");
    }

    // Datum používáme až jako poslední doplňkovou informaci.
    if (sentences.length < 2 && model.lastModified) {
        sentences.push(`Naposledy aktualizován ${formatDate(model.lastModified)}.`);
    }

    return sentences.slice(0, 2).join(" ");
};

// Názvy rodin modelů a nástrojů, které v popisu zůstávají s velkým písmenem.
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

/** Je popisek název rodiny modelu nebo nástroje? */
const isProperName = (label: string): boolean => {
    const [firstWord] = label.split(" ");

    return (
        KEEP_CAPITALIZED.has(firstWord.toLowerCase()) ||
        /[A-Z0-9]/.test(firstWord.slice(1))
    );
};

/** Zmenší popisek, aby se dal vložit doprostřed věty. */
const toSentenceCase = (label: string): string =>
    isProperName(label)
        ? label
        : label.charAt(0).toLowerCase() + label.slice(1);

/** Spojí popisky čárkami a předposlední spojkou „a“. */
const joinCzech = (items: string[]): string =>
    items.length < 2
        ? (items[0] ?? "")
        : `${items.slice(0, -1).join(", ")} a ${items[items.length - 1]}`;
