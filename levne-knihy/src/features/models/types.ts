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
    // Co model dělá, k čemu se používá a čím je zajímavý (2–4 věty)
    overview?: string | null;
    // Konkrétní vlastnosti, kterými se model odlišuje
    highlights?: string[];
    // Jak model funguje, vysvětlené běžným jazykem
    howItWorks?: string | null;
    bestFor?: string[];
    // Konkrétní scénáře použití z dokumentace
    useCases?: string[];
    capabilities?: string[];
    // Druhy vstupů a výstupů (text, obrázky, zvuk, video)
    modalities?: string[];
    inferenceFrameworks?: string[];
    contextLength?: string | null;
    // Stručně architektura a způsob tréninku, pokud je dokumentace uvádí
    architecture?: string | null;
    // Aktivní parametry u modelů typu MoE, pokud je dokumentace uvádí
    activeParameters?: string | null;
    trainingMethod?: string | null;
    // Verze modelu a model, ze kterého tento vychází
    version?: string | null;
    baseModel?: string | null;
    variants?: string[];
    recommendedSettings?: string[];
    // Nároky na hardware a další praktické poznámky z dokumentace
    hardwareRequirements?: string[];
    quantization?: string[];
    compatibility?: string[];
    notes?: string[];
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

