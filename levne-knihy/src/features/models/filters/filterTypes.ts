import type { AIModel } from "../types";

/** Jedna hodnota v nabídce kategorie filtrů. */
export interface FilterOption {
    // Hodnota, která se ukládá do výběru a používá při filtrování
    value: string;
    // Popisek zobrazený uživateli
    label: string;
    // Ikona u popisku související s tématem (pod)kategorie – SVG cesta (viewBox 24×24)
    icon?: string;
    // Volitelně lze definovat vnořené podkategorie
    children?: readonly FilterOption[];
}

/**
 * Konfigurace jedné kategorie filtrů v levém panelu.
 *
 * Každá kategorie umožňuje vybrat jednu či více hodnot.
 * Model vyhoví, když odpovídá alespoň jedné zvolené hodnotě v každé aktivní kategorii.
 */
export interface FilterCategoryConfig {
    // Jedinečný klíč kategorie, z něj se odvodí klíče ve stavu filtrů
    key: string;
    // Titulek kategorie zobrazený v panelu
    title: string;
    // Ikona u titulku kategorie související s jejím významem
    icon: string;
    // Nabídka hodnot zobrazená uživateli
    options: readonly FilterOption[];
    // Hodnoty modelu, které se při klientském filtrování porovnávají se zvolenými hodnotami
    getValues: (model: AIModel) => string[];
}
