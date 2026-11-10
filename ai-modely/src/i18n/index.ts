import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";

import { DEFAULT_NAMESPACE, NAMESPACES, resources } from "./resources";

/** Jazyky, které aplikace umí zobrazit. */
export const SUPPORTED_LANGUAGES = ["cs", "en"] as const;
export type AppLanguage = (typeof SUPPORTED_LANGUAGES)[number];

/** Výchozí jazyk pro všechny, jejichž prohlížeč není česky ani slovensky. */
export const DEFAULT_LANGUAGE: AppLanguage = "en";

/** Aktuální jazyk rozhraní (jen podporovaný, jinak výchozí). */
export const getCurrentLanguage = (): AppLanguage =>
    SUPPORTED_LANGUAGES.find((language) => language === i18n.resolvedLanguage) ?? DEFAULT_LANGUAGE;

/**
 * Detekce jazyka: ruční volba uživatele (localStorage) má přednost,
 * jinak se použije jazyk prohlížeče. Čeština a slovenština vedou na českou
 * verzi, všechny ostatní jazyky na anglickou (fallback). Zvolený jazyk se
 * ukládá do localStorage, takže přežije obnovení stránky.
 */
void i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources,
        ns: NAMESPACES,
        defaultNS: DEFAULT_NAMESPACE,
        supportedLngs: SUPPORTED_LANGUAGES,
        // Kódy s regionem (cs-CZ, en-US) se zkrátí na podporovaný jazyk
        nonExplicitSupportedLngs: true,
        // Chybějící překlad se vždy doplní z angličtiny
        fallbackLng: DEFAULT_LANGUAGE,
        detection: {
            order: ["localStorage", "navigator"],
            caches: ["localStorage"],
            // Slovenština je češtině nejbližší - slovenští uživatelé dostanou českou verzi
            convertDetectedLanguage: (language: string): string =>
                language.toLowerCase().startsWith("sk") ? "cs" : language,
        },
        interpolation: {
            // React hodnoty escapuje sám
            escapeValue: false,
        },
    });

/** Atribut lang dokumentu drží krok se zvoleným jazykem (SEO a čtečky obrazovky). */
const syncDocumentLanguage = (): void => {
    document.documentElement.lang = getCurrentLanguage();
};

syncDocumentLanguage();
i18n.on("languageChanged", syncDocumentLanguage);

export default i18n;
