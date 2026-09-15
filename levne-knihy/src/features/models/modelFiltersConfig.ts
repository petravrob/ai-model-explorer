import type { AIModel } from "./types";


/** Jedna hodnota v nabídce kategorie filtrů. */
export interface FilterOption {
    // Hodnota, která se ukládá do výběru a používá při filtrování
    value: string;
    // Popisek zobrazený uživateli
    label: string;
    // Volitelně lze definovat vnořené podkategorie
    children?: readonly FilterOption[];
}

/**
 * Konfigurace jedné kategorie filtrů v levém panelu.
 * Každá kategorie umožňuje vybrat jednu či více hodnot, model vyhoví,
 * když má aspoň jednu zvolenou hodnotu (kategorie se kombinují současně).
 */
export interface FilterCategoryConfig {
    // Jedinečný klíč kategorie, z něj se odvodí klíče ve stavu filtrů
    key: string;
    // Titulek kategorie zobrazený v panelu
    title: string;
    // Pevná nabídka hodnot kategorie, její pořadí odpovídá zobrazení v panelu
    options: readonly FilterOption[];
    // Hodnoty modelu, které se při filtrování porovnávají se zvolenými hodnotami
    getValues: (model: AIModel) => string[];
}

/** Vytvoří čtení hodnot kategorie z vlastnosti modelu (vlastnost může být řetězec i pole řetězců). */
export const fromModelField =
    (field: keyof AIModel) =>
    (model: AIModel): string[] => {

        const value = model[field];

        if (typeof value === "string") {
            return value ? [value] : [];
        }

        if (Array.isArray(value)) {
            return value.filter((item): item is string => Boolean(item));
        }

        return [];
    };


/**
 * Kategorie filtrů v levém panelu, jejich pořadí odpovídá zobrazení.
 * Nový filtr = nový záznam tady, stav, filtrování i panel se odvodí samy.
 */
export const MODEL_FILTERS_CONFIG = [
    {
        key: "tasks",
        title: "Úloha",
        options: [
            {
                value: "text",
                label: "text",
                children: [
                    { value: "text-generation", label: "generování" },
                    { value: "text-classification", label: "klasifikace" },
                    { value: "translation", label: "překlad" },
                ],
            },
            { value: "text-to-image", label: "generování obrázků" },
            { value: "image-text-to-text", label: "obraz a text na text" },
            { value: "text-to-speech", label: "text na řeč" },
            { value: "automatic-speech-recognition", label: "rozpoznávání řeči" },
        ],
        getValues: fromModelField("task"),
    },
    {
        key: "languages",
        title: "Jazyk",
        options: [
            { value: "en", label: "angličtina" },
            { value: "cs", label: "čeština" },
            { value: "zh", label: "čínština" },
            { value: "de", label: "němčina" },
            { value: "ru", label: "ruština" },
        ],
        getValues: fromModelField("languages"),
    },
] as const satisfies readonly FilterCategoryConfig[];


type FilterConfigEntry = (typeof MODEL_FILTERS_CONFIG)[number];

/** Klíče kategorií filtrů odvozené z konfigurace. */
export type ModelFilterKey = FilterConfigEntry["key"];

/** Stav filtrů odvozený z konfigurace, u každé kategorie seznam zvolených hodnot (prázdný = bez omezení). */
export type ModelFilters = Record<ModelFilterKey, string[]>;

