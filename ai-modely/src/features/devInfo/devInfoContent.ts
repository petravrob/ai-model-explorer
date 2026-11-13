
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
        updatedAt: "13. listopadu 2026",

        status: [
            "Aplikaci nadále aktivně vyvíjím, rozšiřuji její funkce a opravuji nalezené chyby.",
            "Popisy a technické informace generuji pomocí LLM z dokumentace Hugging Face. Výsledky ukládám do MongoDB a při změně zdrojových dat je automaticky aktualizuji.",
            "Generování zajišťuje asynchronní fronta s prioritizací úloh a automatickým přepínáním LLM poskytovatelů. Chybějící obsah se pravidelně předgenerovává na pozadí.",
        ],

        knownIssues: [
            "Některé popisy zatím chybí nebo jejich generování trvá déle kvůli limitům poskytovatelů LLM.",
            "Fuzzy vyhledávání nemusí vždy vracet dostatečně relevantní výsledky.",
            "V aplikaci se mohou vyskytnout drobné chyby.",
        ],

        plannedFeatures: [
            "Vývoj AI agenta, který bude využívat data aplikace k poskytování přesnějších a relevantnějších odpovědí na otázky o AI modelech.",
            "Porovnávání modelů podle schopností, technických parametrů, hardwarových nároků a benchmarků.",
            "Možnost vyzkoušet přímo v aplikaci modely, pro které Hugging Face podporuje online spuštění.",
            "Zpřesnění výsledků vyhledávání.",
            "Využití placených LLM služeb pro rychlejší doplnění chybějícího obsahu.",
            "Doplnění automatizovaných testů frontendu a backendu.",
        ],
    },

    en: {
        updatedAt: "13 November 2026",

        status: [
            "I'm actively developing the application, adding new features and fixing reported issues.",
            "I use LLMs to generate descriptions and technical details from Hugging Face documentation. The results are stored in MongoDB and automatically refreshed when the source data changes.",
            "Content generation runs through an asynchronous job queue with task prioritization and automatic switching between LLM providers. Missing content is also pre-generated regularly in the background.",
        ],

        knownIssues: [
            "Some descriptions are still missing or take longer to generate due to LLM provider limits.",
            "Fuzzy search does not always return sufficiently relevant results.",
            "You may occasionally encounter minor bugs.",
        ],

        plannedFeatures: [
            "Developing an AI agent that uses the application's data to provide more accurate and relevant answers to questions about AI models.",
            "Comparing models by capabilities, technical specifications, hardware requirements and benchmarks.",
            "Letting users try models directly in the application when online inference is supported through Hugging Face.",
            "Improving search relevance.",
            "Using paid LLM services to generate missing content faster.",
            "Adding automated frontend and backend tests.",
        ],
    },
};

