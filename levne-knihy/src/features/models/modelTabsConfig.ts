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
        description: "Všechny modely bez dalšího zúžení.",
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
] as const satisfies readonly ModelTabOption[];

/** Hodnoty štítků odvozené z konfigurace. */
export type ModelTabKey = (typeof MODEL_TABS_CONFIG)[number]["value"];

/** Výchozí štítek výpisu modelů (první hodnota z konfigurace, výpis nezúží). */
export const DEFAULT_TAB: ModelTabKey = MODEL_TABS_CONFIG[0].value;

