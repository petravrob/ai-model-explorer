import type { ModelFilterKey, ModelFilters } from "./filters";

export interface AIModel {
    // Databázový identifikátor (modely načtené živě z Hugging Face ho nemají)
    // TODO: prověřit aktuální práci s databází, možná to upravit
    _id?: string;
    modelId: string;
    name: string;
    author: string;
    task: string;
    languages: string[];
    parameters: number | null;
    downloads: number;
    likes: number;
    tags: string[];
    // Krátký český popis modelu pro kartu (doplňuje ho skript generateDescriptions na serveru)
    description?: string | null;
    license: string | null;
    library: string | null;
    lastModified: string | null;
    url: string;
    avatarUrl: string | null;
}
/** Text model card (README) modelu tak, jak je na Hugging Face. */
export interface ModelCardContent {
    modelId: string;
    // Text karty v Markdownu; null když model vlastní popis nemá
    content: string | null;
}
/** Výsledek benchmarku uvedený přímo v dokumentaci modelu. */
export interface ModelBenchmark {
    name: string;
    // Výsledek přesně tak, jak ho dokumentace uvádí (např. „78,5“ nebo „62,3 %“)
    score: string | number;
    metric?: string | null;
    category?: string | null;
    context?: string | null;
}
/** České přehledy vytvořené z dokumentace modelu na Hugging Face. */
export interface ModelInsights {
    // Co model je a k čemu slouží
    overview?: string | null;
    bestFor?: string[];
    // Konkrétní typy použití z dokumentace
    useCases?: string[];
    capabilities?: string[];
    // Druhy vstupů a výstupů (text, obrázky, zvuk, video)
    modalities?: string[];
    inferenceFrameworks?: string[];
    contextLength?: string | null;
    // Stručně architektura a způsob tréninku, pokud je dokumentace uvádí
    architecture?: string | null;
    trainingMethod?: string | null;
    variants?: string[];
    recommendedSettings?: string[];
    limitations?: string[];
    benchmarks?: ModelBenchmark[];
}
export interface ModelListProps {
    models: AIModel[];
    onModelClick: (model: AIModel) => void;
}
/** Vlastnosti levého panelu s filtry pro filtrování modelů. */
export interface ModelFilterPanelProps {
    filters: ModelFilters;
    isFilterActive: boolean;
    onFilterChange: (key: ModelFilterKey, value: string) => void;
    onReset: () => void;
}

