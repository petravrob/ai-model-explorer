import type { AIModel } from "../types";
import { AUTHOR_FILTER_OPTIONS, LANGUAGE_FILTER_OPTIONS, TASK_FILTER_OPTIONS } from "../filters/filterOptions";

/** Odvozené údaje pro kartu modelu, složené z dat, která o sobě model poskytuje. */

// Autoři z nabídky filtrů mají v kartě čitelný název poskytovatele (Meta, OpenAI…)
const PROVIDER_LABELS = new Map(
    AUTHOR_FILTER_OPTIONS.map((option) => [option.value.toLowerCase(), option.label] as const)
);

// Jazyky z nabídky filtrů mají v kartě český název (angličtina, čeština…)
const LANGUAGE_LABELS = new Map<string, string>(
    LANGUAGE_FILTER_OPTIONS.map((option) => [option.value, option.label])
);

// Názvy úloh se berou z nabídky filtrů, aby karta mluvila stejnými slovy jako panel filtrů
const TASK_LABELS = new Map<string, string>();

TASK_FILTER_OPTIONS.forEach((group) => {
    group.children.forEach((task) => TASK_LABELS.set(task.value, task.label));
});

// Kolik doplňkových štítků se vejde do karty vedle úlohy a jazyka
const MAX_SECONDARY_TAGS = 4;

/*
 * České názvy štítků, které nabídka filtrů nezná (schopnosti, zaměření, známé rodiny modelů).
 * Ostatní štítky bez názvu se do karty neposílají, aby v ní nezůstávala anglická slova.
 */
const TAG_LABELS = new Map<string, string>([
    // úlohy, které v nabídce filtrů nejsou
    ["text2text-generation", "Generování"],
    ["unconditional-image-generation", "Generování"],
    ["fill-mask", "Doplňování textu"],
    ["zero-shot-classification", "Klasifikace bez příkladů"],
    ["multiple-choice", "Výběr odpovědí"],
    ["zero-shot-image-classification", "Rozpoznávání obrázků bez příkladů"],
    ["depth-estimation", "Odhad hloubky"],
    ["mask-generation", "Generování masek"],
    // schopnosti a oblasti použití
    ["conversational", "Konverzace"],
    ["reasoning", "Uvažování"],
    ["code", "Kód"],
    ["coding", "Kód"],
    ["math", "Matematika"],
    ["chat", "Chat"],
    ["moe", "Směs expertů"],
    ["vision", "Zpracování obrazu"],
    ["multimodal", "Multimodální"],
    ["multilingual", "Vícejazyčný"],
    ["long-context", "Dlouhý kontext"],
    ["tool-calling", "Volání nástrojů"],
    ["function-calling", "Volání funkcí"],
    ["instruction-following", "Dodržování instrukcí"],
    ["agents", "Agenti"],
    ["rag", "RAG"],
    ["ocr", "OCR"],
    ["embeddings", "Embeddingy"],
    ["embedding", "Embeddingy"],
    ["zero-shot", "Bez příkladů"],
    ["distillation", "Destilace"],
    ["speculative-decoding", "Spekulativní dekódování"],
    ["uncensored", "Necenzurovaný"],
    ["image-generation", "Generování"],
    ["diffusion", "Difúze"],
    ["lora", "LoRA"],
    ["controlnet", "ControlNet"],
    ["stable-diffusion", "Stable Diffusion"],
    ["stable-diffusion-xl", "Stable Diffusion XL"],
    ["sdxl", "Stable Diffusion XL"],
    ["flux", "FLUX"],
    ["inpainting", "Domalování"],
    ["style-transfer", "Přenos stylu"],
    ["upscaling", "Zvětšování"],
    ["photorealistic", "Fotorealistické"],
    ["photography", "Fotografie"],
    ["cinematic", "Filmové"],
    ["portrait", "Portréty"],
    ["realistic", "Realistické"],
    ["illustration", "Ilustrace"],
    ["anime", "Anime"],
    ["art", "Umění"],
    ["artistic", "Umělecké"],
    // řeč a zvuk
    ["audio", "Zvuk"],
    ["speech", "Řeč"],
    ["voice", "Hlas"],
    ["tts", "Převod textu na řeč"],
    ["asr", "Přepis řeči"],
    ["speech-synthesis", "Převod textu na řeč"],
    ["speech-generation", "Generování řeči"],
    ["speech-to-text", "Přepis řeči"],
    ["voice-cloning", "Klonování hlasu"],
    ["voice-clone", "Klonování hlasu"],
    ["voice-conversion", "Převod hlasu"],
    ["voice-design", "Návrh hlasu"],
    ["voice-agent", "Hlasový agent"],
    ["speaker", "Mluvčí"],
    ["speaker-diarization", "Rozlišení mluvčích"],
    ["speaker-recognition", "Rozpoznávání mluvčích"],
    ["speaker-verification", "Ověřování mluvčích"],
    ["speaker-identification", "Identifikace mluvčích"],
    ["speaker-change-detection", "Změny mluvčích"],
    ["source-separation", "Oddělování zvuků"],
    ["emotion", "Emoce"],
    ["emotions", "Emoce"],
    ["emotion-control", "Řízení emocí"],
    ["expressive-speech", "Expresivní řeč"],
    ["forced-alignment", "Časování slov"],
    ["whisper", "Whisper"],
    ["wav2vec2", "wav2vec 2.0"],
    ["streaming", "Streamování"],
    ["low-latency", "Nízká latence"],
    ["realtime", "V reálném čase"],
    // známé rodiny a architektury modelů (jejich názvy se nepřekládají)
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
]);

/** Převede technickou hodnotu ze zdroje na čitelný popisek (např. „text-generation“ na „Text generation“). */
const toLabel = (value: string): string => {

    const label = value.replace(/[-_]/g, " ").trim();

    return label.charAt(0).toUpperCase() + label.slice(1);
};

/** Najde český název štítku, stejnými slovy jako v nabídce filtrů. Neznámý štítek vrátí null. */
const toTagLabel = (tag: string): string | null => {

    const value = tag.toLowerCase();
    const taskLabel = TASK_LABELS.get(value);

    return taskLabel ? toLabel(taskLabel) : (TAG_LABELS.get(value) ?? null);
};

/** Jazyk do řady štítků, u vícejazyčných modelů „Vícejazyčný“, jinak název jazyka. */
const toLanguageTag = (languages: string[]): string | null => {

    if (languages.length === 0) {
        return null;
    }

    if (languages.length > 1) {
        return "Vícejazyčný";
    }

    const [language] = languages;
    const languageLabel = LANGUAGE_LABELS.get(language);

    if (languageLabel) {
        return toLabel(languageLabel);
    }

    // Neznámý jazyk zůstane v řadě štítků jako kód (např. „AR“)
    return language.length <= 3 ? language.toUpperCase() : toLabel(language);
};

/** Údaje pro řadu štítků v kartě. */
export interface ModelTagList {
    // Hlavní úloha modelu (pipeline_tag)
    primary: string | null;
    // Doplňkové schopnosti, které se do karty vejdou
    secondary: string[];
    // Jazyk modelu do řady štítků, případně null
    language: string | null;
    // Kolik dalších štítků zůstalo mimo kartu
    remaining: number;
}

/** Čitelný název poskytovatele modelu. Neznámé autory necháme tak, jak je uvádí Hugging Face. */
export const getModelProvider = (author: string): string =>
    PROVIDER_LABELS.get(author.toLowerCase()) ?? author;

/** Poskládá štítky karty z úlohy modelu, několika doplňkových štítků a jazyka. */
export const getModelTagList = (model: AIModel): ModelTagList => {

    // Úlohu modelu ukazujeme vždy, i když pro ni český název nemáme
    const primary = model.task ? (toTagLabel(model.task) ?? toLabel(model.task)) : null;
    const language = toLanguageTag(model.languages);
    const secondary: string[] = [];
    let remaining = 0;

    model.tags.forEach((tag) => {

        // Ostatní štítky bez českého názvu (knihovny, formáty, licence, kódy jazyků) karta vynechává
        const label = typeof tag === "string" ? toTagLabel(tag) : null;

        // Úloha ani jazyk modelu se v řadě štítků neopakuje
        if (label === null || label === language || label.toLowerCase() === primary?.toLowerCase()) {
            return;
        }

        // Překrývající se štítky se v kartě neopakují: zůstane jen ten konkrétnější
        // (např. „RoBERTa“ místo „BERT“ nebo „Stable Diffusion XL“ místo „Stable Diffusion“)
        const generalIndex = secondary.findIndex((existing) => label.includes(existing));

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

    return { primary, secondary, language, remaining };
};

/** Krátký popis do karty. Když ho zdroj neuvádí, složí se z ostatních údajů modelu. */
export const getModelSummary = (model: AIModel): string => {

    const description = model.description?.trim();

    if (description) {
        return description;
    }

    const parts = [`Model pro úlohu „${toTagLabel(model.task) ?? toLabel(model.task)}“`];

    if (model.library) {
        parts.push(`knihovna ${model.library}`);
    }

    if (model.languages.length > 0) {
        // „podpora 1 jazyka“, „podpora 3 jazyků“
        parts.push(`podpora ${model.languages.length} ${model.languages.length === 1 ? "jazyka" : "jazyků"}`);
    }

    return `${parts.join(", ")}.`;
};

