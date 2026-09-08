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
