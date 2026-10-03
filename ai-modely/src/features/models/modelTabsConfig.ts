import type { AIModel } from "./types";

/** Jedna hodnota štítku nad výpisem modelů. */
export interface ModelTabOption {
    // Hodnota štítku, posílá se do API jako parametr
    value: string;
    // Popisek zobrazený uživateli
    label: string;
    // Vysvětlení významu štítku (zobrazí se jako nápověda i pod štítky nad výpisem)
    description: string;
    // Vyfiltruje načtený výpis modelů na ty, které štítku odpovídají
    filter: (models: AIModel[]) => AIModel[];
}

// Kolik dní od zveřejnění se model ještě považuje za nový
const NEW_MODEL_DAYS = 60;

// Štítky (tagy) Hugging Face, podle kterých se pozná kvantizovaná varianta pro běh na vlastním počítači
const LOCAL_FORMAT_TAGS = ["gguf", "awq", "gptq", "onnx", "openvino", "mlx"];

// Největší model (v parametrech), který se ještě vejde na běžný počítač
const LOCAL_MAX_PARAMETERS = 1_000_000_000;

// Nejméně velký model (v parametrech), který už patří na server nebo výkonné GPU
const SERVER_MIN_PARAMETERS = 13_000_000_000;

/** Určí, zda byl model zveřejněn v posledních zadaných dnech. */
const isNewlyCreated = (createdAt: string | null | undefined, days: number): boolean => {

    if (!createdAt) {
        return false;
    }

    const createdTimestamp = new Date(createdAt).getTime();

    return Number.isFinite(createdTimestamp) &&
        Date.now() - createdTimestamp <= days * 24 * 60 * 60 * 1000;
};

/** Určí, zda má model úplné údaje pro bezpečné použití (licenci, velikost i knihovnu) a je používaný. */
const isRecommendedModel = (model: AIModel): boolean =>
    Boolean(model.license && model.library && model.parameters && model.likes > 0);

/** Určí, zda má model kvantizovanou variantu pro běh na vlastním počítači. */
const hasLocalFormat = (model: AIModel): boolean =>
    (model.tags ?? []).some((tag) => LOCAL_FORMAT_TAGS.includes(tag));

/** Určí, zda model zvládne běžný počítač (má kvantizovanou variantu nebo je dost malý). */
const isLocalModel = (model: AIModel): boolean =>
    hasLocalFormat(model) ||
    Boolean(model.parameters && model.parameters <= LOCAL_MAX_PARAMETERS);

/** Určí, zda model patří na server nebo výkonné GPU (je nad zvolenou velikost). */
const isServerModel = (model: AIModel): boolean =>
    Boolean(model.parameters && model.parameters > SERVER_MIN_PARAMETERS);

/**
 * Štítky nad výpisem modelů, jejich pořadí odpovídá zobrazení.
 * První štítek je výchozí a výpis nijak nezúží. Každá hodnota musí mít
 * odpovídající zápis v TAB_SORT_KEYS v huggingFaceService, který určuje,
 * z jakého výpisu Hugging Face se pro štítek modely vybírají.
 */
export const MODEL_TABS_CONFIG = [
    {
        value: "all",
        label: "Vše",
        description: "Prohlížení všech dostupných modelů.",
        filter: (models: AIModel[]) => models,
    },
    {
        value: "recommended",
        label: "Doporučené",
        description: "Osvědčené modely s jasnou licencí, známou velikostí i knihovnou.",
        filter: (models: AIModel[]) => models.filter(isRecommendedModel),
    },
    {
        value: "new",
        label: "Nové",
        description: "Modely zveřejněné na Hugging Face za poslední dva měsíce.",
        filter: (models: AIModel[]) =>
            models.filter((model) => isNewlyCreated(model.createdAt, NEW_MODEL_DAYS)),
    },
    {
        value: "trending",
        label: "Trendující",
        description: "Nejoblíbenější modely, které právě nabírají na popularitě (skóre trendů Hugging Face).",
        filter: (models: AIModel[]) =>
            models.filter((model) => (model.trendingScore ?? 0) > 0),
    },
    {
        value: "local",
        label: "Lokální běh",
        description: "Modely s kvantizovanou variantou (GGUF, AWQ, GPTQ) nebo do 1 mld. parametrů, které lze spustit i na běžném počítači.",
        filter: (models: AIModel[]) => models.filter(isLocalModel),
    },
    {
        value: "server",
        label: "Na serveru",
        description: "Modely nad 13 mld. parametrů, které potřebují výkonný server nebo GPU.",
        filter: (models: AIModel[]) => models.filter(isServerModel),
    },
] as const satisfies readonly ModelTabOption[];

/** Hodnoty štítků odvozené z konfigurace. */
export type ModelTabKey = (typeof MODEL_TABS_CONFIG)[number]["value"];

/** Výchozí štítek výpisu modelů (první hodnota z konfigurace, výpis nezúží). */
export const DEFAULT_TAB: ModelTabKey = MODEL_TABS_CONFIG[0].value;

