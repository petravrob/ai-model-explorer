/** Zformuje velké číslo do kompaktní podoby (např. „251 mil.“). */
export const formatCount = (value: number): string =>
    new Intl.NumberFormat("cs-CZ", {
        notation: "compact",
        maximumFractionDigits: 1,
    }).format(value);

/** Zformuje počet parametrů modelu (např. „8 mld.“). */
export const formatParameters = (value: number | null): string =>
    value === null ? "—" : formatCount(value);

/** Zformuje datum do české podoby (např. „25. 9. 2024“). */
export const formatDate = (value: string | null): string =>
    value === null ? "—" : new Date(value).toLocaleDateString("cs-CZ");

/** Zkrátí seznam jazyků na několik kódů a zbytek shrne počtem (např. „EN, ZH, +8“). */
export const formatLanguages = (languages: string[], maxVisible = 2): string => {

    if (languages.length === 0) {
        return "—";
    }

    // Kódy jazyků se zobrazují velkými písmeny, delší názvy zůstanou v původní podobě
    const visible = languages
        .slice(0, maxVisible)
        .map((language) => (language.length <= 3 ? language.toUpperCase() : language));

    const remaining = languages.length - visible.length;

    return remaining > 0
        ? `${visible.join(", ")}, +${remaining}`
        : visible.join(", ");
};
