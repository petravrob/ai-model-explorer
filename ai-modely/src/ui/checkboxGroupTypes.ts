/** Jedna hodnota filtru. */
export interface CheckboxGroupOption {
    value: string;
    label: string;
    // Ikona u popisku podkategorie - SVG
    icon?: string;
    children?: readonly CheckboxGroupOption[];
}

/** Hodnota filtru připravená k zobrazení, u podkategorie s počtem schovaných hodnot. */
export interface CheckboxGroupDisplayOption {
    value: string;
    label: string;
    icon?: string;
    // Hodnoty podkategorie, které se mají zobrazit
    children?: CheckboxGroupDisplayOption[];
    // Kolik hodnot podkategorie zůstalo schovaných ve zkrácené nabídce
    hiddenCount: number;
}
