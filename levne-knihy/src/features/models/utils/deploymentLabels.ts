/**
 * České popisy způsobů nasazení a nástrojů pro spuštění modelu.
 *
 * Názvy z dokumentace se nemění, český popis se doplňuje pouze při vykreslení v UI.
 * U neznámého nástroje nebo služby se použije obecné vysvětlení.
 */

/** Převodní klíč: bez okrajových mezer, malými písmeny. */
const normalize = (text: string): string => text.trim().toLowerCase();

/** Popisy známých nástrojů a služeb pro nasazení a použití modelu. */
const DEPLOYMENT_DESCRIPTIONS: Record<string, string> = {
    // Programové knihovny
    "python sdk": "Knihovna, kterou model spustíte přímo ve svém programu v Pythonu.",
    "python": "Spuštění modelu přímo v programu v Pythonu.",
    "javascript": "Spuštění modelu přímo v prohlížeči nebo v aplikaci v JavaScriptu.",
    "transformers": "Oficiální knihovna Hugging Face pro běh modelu v Pythonu.",
    "pytorch": "Programová knihovna pro běh modelů v Pythonu.",
    "tensorflow": "Programová knihovna pro běh modelů od Googlu.",

    // Formáty a nástroje pro běh modelu
    "onnx": "Univerzální formát, ve kterém model poběží v mnoha různých nástrojích.",
    "onnx runtime": "Nástroj pro rychlý běh modelů ve formátu ONNX.",
    "safetensors": "Bezpečný formát pro uložení natrénovaných vah modelu.",
    "bitsandbytes": "Nástroj pro úspornější běh modelu (kvantizace).",

    // Provoz na serveru a přes síť
    "vllm": "Nástroj pro rychlé nasazení velkých jazykových modelů na serveru.",
    "text generation inference": "Nástroj Hugging Face pro provoz modelu na serveru.",
    "tgi": "Nástroj Hugging Face pro provoz modelu na serveru.",
    "rest api": "Rozhraní, přes které model volají jiné aplikace po síti.",
    "api": "Rozhraní, přes které model volají jiné aplikace po síti.",
    "inference api": "Online služba, která model spustí na serveru za vás.",
    "hugging face inference api": "Online služba Hugging Face, která model spustí za vás.",
    "laya-serve": "Vlastní server, přes který model nabídnete ostatním aplikacím.",
    "jev api": "Hostovaná služba, přes kterou model voláte po síti (stejné rozhraní jako laya-serve).",
    "router": "Část, která pro každý dotaz sama vybere vhodnou variantu modelu.",

    // Běh na vlastním počítači
    "llama.cpp": "Nástroj pro běh modelů i na běžném počítači bez výkonné grafiky.",
    "ollama": "Nástroj pro snadné spuštění modelů na vlastním počítači.",
    "docker": "Zabalené prostředí, ve kterém model běží stejně na jakémkoli počítači.",
    "cli": "Ovládání modelu z příkazové řádky.",
};

/** Krátký český popis, k čemu daný způsob nasazení slouží. */
export const getDeploymentDescription = (name: string): string =>
    DEPLOYMENT_DESCRIPTIONS[normalize(name)] ??
    "Nástroj nebo služba, kterou můžete model spustit a používat.";
