
import type { AppLanguage } from "@/i18n";

/** Informace o aktuálním vývoji aplikace v jednotlivých jazycích. */
export interface DevInfoLanguageContent {
    updatedAt: string;
    status: string[];
    knownIssues: string[];
    plannedFeatures: string[];
}

/** Obsah okna "Vývoj aplikace". */
export const DEV_INFO_CONTENT: Record<AppLanguage, DevInfoLanguageContent> = {
    cs: {
        updatedAt: "12. listopadu 2026",

        status: [
            "Aplikace je veřejně dostupná a stále na ní aktivně pracuji.",
            "Průběžně doplňuji informace o AI modelech, opravuji chyby a vylepšuji jednotlivé funkce.",
        ],

        knownIssues: [
            "U některých modelů zatím chybí automaticky generované popisy a podrobnější informace. Jejich doplnění může nějakou dobu trvat.",
            "Aplikace je stále ve vývoji, proto se mohou občas objevit drobné chyby.",
        ],

        plannedFeatures: [
            "Rychlejší načítání a dostupnost popisů a podrobných informací o modelech.",
            "Další vylepšení vyhledávání, filtrování a procházení modelů.",
            "Automatizované testování pro zvýšení spolehlivosti aplikace.",
        ],
    },

    en: {
        updatedAt: "12 November 2026",

        status: [
            "The application is publicly available, and I'm still actively working on it.",
            "I'm regularly adding information about AI models, fixing bugs and improving existing features.",
        ],

        knownIssues: [
            "Some models don't have AI-generated descriptions or detailed information available yet. It may take some time for this content to be added.",
            "The application is still under development, so you may occasionally encounter minor issues.",
        ],

        plannedFeatures: [
            "Faster loading and better availability of model descriptions and detailed information.",
            "Further improvements to model search, filtering and browsing.",
            "Automated testing to improve the application's reliability.",
        ],
    },
};
