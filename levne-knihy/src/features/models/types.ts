export interface AIModel {
    _id: string;
    modelId: string;
    name: string;
    author: string;
    task: string;
    parameters: number | null;
    downloads: number;
    likes: number;
    tags: string[];
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
/** Zvolené předvolby pro filtrování modelů v levém panelu (prázdný seznam = bez omezení). */
export interface ModelFilters {
    tasks: string[];
}
/** Nabídka hodnot jednotlivých předvoleb odvozená z načtených modelů. */
export interface ModelFilterOptions {
    tasks: string[];
}
/** Vlastnosti levého panelu s předvolbami pro filtrování modelů. */
export interface ModelFilterPanelProps {
    filters: ModelFilters;
    options: ModelFilterOptions;
    isFilterActive: boolean;
    onFilterChange: (name: keyof ModelFilters, value: string) => void;
    onReset: () => void;
}

