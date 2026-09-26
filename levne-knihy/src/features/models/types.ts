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
    // Lidský český popis modelu pro kartu (doplňuje ho skript generate:descriptions na serveru)
    description?: string | null;
    license: string | null;
    library: string | null;
    lastModified: string | null;
    url: string;
    avatarUrl: string | null;
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

