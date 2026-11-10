import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";

import cs from "./locales/cs.json";
import en from "./locales/en.json";

/** Jazyky, které aplikace umí zobrazit. */
export const SUPPORTED_LANGUAGES = ["cs", "en"] as const;
export type AppLanguage = (typeof SUPPORTED_LANGUAGES)[number];

/** Výchozí jazyk pro všechny, jejichž prohlížeč není česky ani slovensky. */
export const DEFAULT_LANGUAGE: AppLanguage = "en";

/**
 * Detekce jazyka: ruční volba uživatele (localStorage) má přednost,
 * jinak se použije jazyk prohlížeče. Čeština a slovenština vedou na českou
 * verzi, všechny ostatní jazyky na anglickou (fallback).
 */
void i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources: {
            cs: { translation: cs },
            en: { translation: en },
        },
        supportedLngs: SUPPORTED_LANGUAGES,
        // Kódy s regionem (cs-CZ, en-US) se zkrátí na podporovaný jazyk
        nonExplicitSupportedLngs: true,
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
        returnNull: false,
    });

/** Atribut lang dokumentu drží krok se zvoleným jazykem (SEO a čtečky obrazovky). */
const syncDocumentLanguage = (language: string): void => {
    document.documentElement.lang = language;
};

syncDocumentLanguage(i18n.resolvedLanguage ?? DEFAULT_LANGUAGE);
i18n.on("languageChanged", syncDocumentLanguage);

export default i18n;
