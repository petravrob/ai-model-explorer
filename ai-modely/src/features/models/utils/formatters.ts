import { getCurrentLanguage } from "@/i18n";
import type { AppLanguage } from "@/i18n";
import { translate } from "@/i18n/translate";

// Regionální podoba jazyka pro Intl (formát čísel a dat podle zvoleného jazyka rozhraní)
const INTL_LOCALES: Record<AppLanguage, string> = {
    cs: "cs-CZ",
    en: "en-GB",
};

/** Locale pro Intl odvozené z aktuálního jazyka rozhraní. */
export const getIntlLocale = (): string => INTL_LOCALES[getCurrentLanguage()];

/** Text, který se zobrazí místo chybějícího údaje. */
const missingValue = (): string => translate("common:missingValue");

/** Zformuje velké číslo do kompaktní podoby (např. „251 mil.“ nebo „251M“). */
export const formatCount = (value: number): string =>
    new Intl.NumberFormat(getIntlLocale(), {
        notation: "compact",
        maximumFractionDigits: 1,
    }).format(value);

/** Zformuje počet parametrů modelu (např. „8 mld.“). */
export const formatParameters = (value: number | null): string =>
    value === null ? missingValue() : formatCount(value);

/** Zformuje datum podle jazyka rozhraní (např. „25. 9. 2024“ nebo „25/09/2024“). */
export const formatDate = (value: string | null): string =>
    value === null ? missingValue() : new Intl.DateTimeFormat(getIntlLocale()).format(new Date(value));

/** Zkrátí seznam jazyků na několik kódů a zbytek shrne počtem (např. „EN, ZH, +8“). */
export const formatLanguages = (languages: string[] = [], maxVisible = 2): string => {

    if (languages.length === 0) {
        return missingValue();
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
