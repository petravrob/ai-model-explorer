import type { ModelFilterKey, ModelFilters } from "./filters";

export interface AIModel {
    // Databázový identifikátor (modely načtené živě z Hugging Face ho nemají)
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
    trendingScore?: number | null;
    createdAt?: string | null;
    // Delší český popis modelu (2-3 odstavce) - na kartě se ukazuje jen úryvek, celý je v detailu
    description?: string | null;
    license: string | null;
    library: string | null;
    lastModified: string | null;
    url: string;
    avatarUrl: string | null;
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
/** Obrázek převzatý z dokumentace modelu (diagram, ukázka výsledků). */
export interface ModelInsightImage {
    url: string;
    // Popisek obrázku z dokumentace (může být i prázdný)
    alt: string;
    // Nadpis, pod kterým obrázek v dokumentaci stojí
    caption?: string;
}
/** Video převzaté z dokumentace modelu. */
export interface ModelInsightVideo {
    url: string;
    // Text odkazu nebo nadpis, pod kterým video v dokumentaci stojí
    title: string;
    // Náhledový obrázek videa, pokud ho zdroj poskytuje
    thumbnail: string;
}
/** České přehledy vytvořené z dokumentace modelu na Hugging Face. */
export interface ModelInsights {
    // Konkrétní vlastnosti, kterými se model odlišuje
    highlights?: string[];
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
    limitations?: string[];
    benchmarks?: ModelBenchmark[];
    // Obrázky z dokumentace modelu (diagramy, ukázky výsledků)
    images?: ModelInsightImage[];
    // Videa z dokumentace modelu (mp4, YouTube)
    videos?: ModelInsightVideo[];
}
export interface ModelListProps {
    models: AIModel[];
    onModelClick: (model: AIModel) => void;
    // Identifikátory modelů, kterým se popisek teprve generuje (karta za něj drží připravený prostor)
    pendingDescriptionIds?: string[];
}
/** Vlastnosti levého panelu s filtry pro filtrování modelů. */
export interface ModelFilterPanelProps {
    filters: ModelFilters;
    isFilterActive: boolean;
    onFilterChange: (key: ModelFilterKey, value: string) => void;
    onReset: () => void;
    // Potvrzení filtrů na telefonu (stránka s filtry se zavře)
    onApply: () => void;
}
