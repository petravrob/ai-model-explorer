import type { AIModel } from "../types";
import { AUTHOR_FILTER_OPTIONS, TASK_FILTER_OPTIONS } from "../filters/filterOptions";

/** Odvozené údaje pro kartu modelu, složené z dat, která o sobě model poskytuje. */

// Autoři z nabídky filtrů mají v kartě čitelný název poskytovatele (Meta, OpenAI…)
const PROVIDER_LABELS = new Map(
    AUTHOR_FILTER_OPTIONS.map((option) => [option.value.toLowerCase(), option.label] as const)
);

// Názvy úloh se berou z nabídky filtrů, aby karta mluvila stejnými slovy jako panel filtrů.
// K popisku si proto pamatujeme i skupinu, ve které se v nabídce nachází.
const TASK_LABELS = new Map<string, string>();
const TASK_GROUPS = new Map<string, string>();
const taskLabelGroups = new Map<string, Set<string>>();

TASK_FILTER_OPTIONS.forEach((group) => {
    group.children.forEach((task) => {
        TASK_LABELS.set(task.value, task.label);
        TASK_GROUPS.set(task.value, group.label);
        taskLabelGroups.set(task.label, (taskLabelGroups.get(task.label) ?? new Set()).add(group.label));
    });
});

// Názvy skupin v druhém pádě, aby se daly spojit s popiskem úlohy (např. „generování obrázků“)
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
 * České názvy štítků, které nabídka filtrů nezná (schopnosti, zaměření, známé rodiny modelů).
 * Ostatní štítky bez názvu se do karty neposílají, aby v ní nezůstávala anglická slova.
 */
const TAG_LABELS = new Map<string, string>([
    // úlohy, které v nabídce filtrů nejsou

    ["text2text-generation", "Převod a generování textu"],
    ["unconditional-image-generation", "Generování obrázků bez zadání"],
    ["fill-mask", "Doplňování chybějících slov"],
    ["zero-shot-classification", "Klasifikace bez předchozích příkladů"],
    ["multiple-choice", "Řešení otázek s výběrem odpovědi"],
    ["zero-shot-image-classification", "Rozpoznávání obrázků bez předchozích příkladů"],
    ["depth-estimation", "Odhad hloubky v obraze"],
    ["mask-generation", "Vytváření obrazových masek"],

    // schopnosti a oblasti použití

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

    // řeč a zvuk

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

    // známé rodiny a architektury modelů
    // jejich názvy se nepřekládají

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

// Běžné licence se v kartě zobrazují v obvyklé podobě („MIT“ místo „mit“)
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

/** Převede technickou hodnotu ze zdroje na čitelný popisek (např. „text-generation“ na „Text generation“). */
const toLabel = (value: string): string => {

    const label = value.replace(/[-_]/g, " ").trim();

    return label.charAt(0).toUpperCase() + label.slice(1);
};

/** Najde český název štítku, stejnými slovy jako v nabídce filtrů. Neznámý štítek vrátí null. */
const toTagLabel = (tag: string): string | null => {

    const value = tag.toLowerCase();
    const taskLabel = TASK_LABELS.get(value);

    if (!taskLabel) {
        return TAG_LABELS.get(value) ?? null;
    }

    // Popisek, který nabídka používá ve více skupinách (např. „generování“ u textu i obrázků),
    // dá smysl jen s názvem skupiny: „generování textu“, „generování obrázků“, „generování videa“
    const needsGroup = (taskLabelGroups.get(taskLabel)?.size ?? 0) > 1;

    if (!needsGroup) {
        return toLabel(taskLabel);
    }

    const group = TASK_GROUPS.get(value) ?? "";

    return toLabel(`${taskLabel} ${GROUP_GENITIVES.get(group) ?? group}`);
};

/** Údaje pro řadu štítků v kartě. */
export interface ModelTagList {
    // Hlavní úloha modelu (pipeline_tag)
    primary: string | null;
    // Doplňkové schopnosti, které se do karty vejdou
    secondary: string[];
    // Kolik dalších štítků zůstalo mimo kartu
    remaining: number;
}

/** Čitelný název poskytovatele modelu. Neznámé autory necháme tak, jak je uvádí Hugging Face. */
export const getModelProvider = (author: string): string =>
    PROVIDER_LABELS.get(author.toLowerCase()) ?? author;

/** Čitelný název licence, případně pomlčka když ji model neuvádí. */
export const getModelLicense = (license: string | null): string =>
    license ? (LICENSE_LABELS.get(license.toLowerCase()) ?? license) : "—";

/** Poskládá štítky karty z úlohy modelu a několika doplňkových štítků. */
export const getModelTagList = (model: AIModel): ModelTagList => {

    // Úlohu modelu ukazujeme vždy, i když pro ni český název nemáme
    const primary = model.task ? (toTagLabel(model.task) ?? toLabel(model.task)) : null;
    const secondary: string[] = [];
    let remaining = 0;

    model.tags.forEach((tag) => {

        // Ostatní štítky bez českého názvu (knihovny, formáty, licence, kódy jazyků) karta vynechává
        const label = typeof tag === "string" ? toTagLabel(tag) : null;

        // Úloha modelu se v řadě štítků neopakuje
        if (label === null || label.toLowerCase() === primary?.toLowerCase()) {
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

    return { primary, secondary, remaining };
};

/**
 * Lidský popis modelu pro kartu. Vzniká mimo aplikaci (skript generate:descriptions
 * na serveru) a ukládá se k modelu do databáze. Dokud popis chybí, karta ho nevykresluje –
 * žádná „strojová“ věta se do karty nedoplňuje.
 */
export const getModelSummary = (model: AIModel): string | null =>
    model.description?.trim() || null;

