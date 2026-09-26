import Fuse, { type IFuseOptions } from "fuse.js";
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import { AIModel } from "../types";
import { SEARCH_QUERY_PARAM, modelDetailUrl } from "@/routes/paths";
import { createDescriptions, getModels } from "../api/modelsApi";
import useModelFilters from "./useModelFilters";
import { DEFAULT_SORT, type ModelSortKey } from "../modelSortsConfig";

/** Převede text na malá písmena bez diakritiky pro nezávislé vyhledávání. */
const normalizeText = (text: string): string =>
    text
        .normalize("NFD")
        .replace(/\p{Diacritic}/gu, "")
        .toLowerCase();

/** Nastavení fuzzy vyhledávání, které se použije, když přesné hledání nic nenajde. */
const FUSE_OPTIONS: IFuseOptions<AIModel> = {
    keys: [
        { name: "name", weight: 0.5 },
        { name: "author", weight: 0.25 },
        { name: "modelId", weight: 0.15 },
        { name: "task", weight: 0.05 },
        { name: "tags", weight: 0.05 },
    ],
    threshold: 0.45,
    ignoreLocation: true,
    ignoreDiacritics: true,
    minMatchCharLength: 2,
};

// Zpoždění načtení po změně filtrů, aby se rychlé po sobě jdoucí změny sloučily do jednoho požadavku
const FILTERS_FETCH_DELAY_MS = 400;

// Kolik modelů se zobrazí na jedno načtení (menší množství znamená méně generovaných popisků)
const MODELS_PER_LOADING = 24;

/** Obstarává logiku zobrazení seznamu modelů a přechodu na jejich detail */
function useModelBrowser() {

    // Uložená plná sada modelů z posledního serverového načtení. Filtry ji jen zúží,
    // nesmí ji přepsat prázdným seznamem po konkrétním vyfiltrování.
    const [allModels, setAllModels] = useState<AIModel[]>([]);

    const [loading, setLoading] =
        useState<boolean>(true);

    const [error, setError] =
        useState<string | null>(null);

    // Příznak dokončeného úvodního načtení – při obnově kvůli filtrům zůstane na stránce stávající výpis
    const [hasLoaded, setHasLoaded] =
        useState<boolean>(false);

    const navigate = useNavigate();

    const [searchParams] = useSearchParams();
    const latestRequestIdRef = useRef(0);

    // Hledaný výraz z URL (např. /?q=gpt), oříznutý o okrajové mezery
    const searchQuery = (searchParams.get(SEARCH_QUERY_PARAM) ?? "").trim();

    // Filtry z levého panelu, které zúží výpis před samotným hledáním
    const {
        filters,
        isFilterActive,
        handleFilterChange,
        resetFilters,
        filteredModels,
    } = useModelFilters(allModels);

    // Zvolený způsob řazení výpisu modelů
    const [sort, setSort] = useState<ModelSortKey>(DEFAULT_SORT);

    // Kolik modelů je z výpisu zobrazených (další se přidají tlačítkem)
    const [visibleCount, setVisibleCount] = useState<number>(MODELS_PER_LOADING);

    // Načtení modelů podle zvolených filtrů (s filtry se filtruje přímo na serveru z Hugging Face)
    // TODO: prověřit aktuální práci s databází, možná to upravit
    useEffect(() => {

        const requestId = ++latestRequestIdRef.current;
        const controller = new AbortController();

        // Obnova se ohlásí hned (i během čekání na sloučení změn filtrů),
        // dříve načtené modely přitom zůstanou zobrazené, dokud nedorazí nová data
        setLoading(true);
        setError(null);

        const loadModels = async (): Promise<void> => {

            try {

                const data = await getModels(filters, sort, controller.signal);

                if (controller.signal.aborted || requestId !== latestRequestIdRef.current) {
                    return;
                }

                setAllModels(data);
                setHasLoaded(true);

                // Nový výpis začíná prvními načtenými modely
                setVisibleCount(MODELS_PER_LOADING);

            } catch (error) {

                if (controller.signal.aborted || requestId !== latestRequestIdRef.current) {
                    return;
                }

                console.error(
                    "Nepodařilo se načíst modely:",
                    error
                );

                const errorMessage =
                    error instanceof Error
                        ? error.message
                        : "Nepodařilo se načíst modely.";

                setError(errorMessage);

            } finally {

                if (controller.signal.aborted || requestId !== latestRequestIdRef.current) {
                    return;
                }

                setLoading(false);

            }

        };

        // Úvodní načtení se spustí hned, zpoždění slouží jen ke sloučení rychlých změn filtrů
        const fetchDelay = hasLoaded ? FILTERS_FETCH_DELAY_MS : 0;

        const timeoutId = setTimeout(() => {
            void loadModels();
        }, fetchDelay);

        return () => {
            controller.abort();
            clearTimeout(timeoutId);
        };

    }, [filters, sort]);

    // Fuzzy vyhledávání nad modely vyfiltrovanými podle filtrů (index se sestaví jen při načtení nebo změně dat)
    const fuzzySearch = useMemo(
        () => new Fuse(filteredModels, FUSE_OPTIONS),
        [filteredModels]
    );

    // Přesné hledání podle hledaného výrazu (název, autor, úloha, identifikátor i štítky,
    // bez rozlišení velikosti písmen a diakritiky)
    const normalizedQuery = normalizeText(searchQuery);

    const exactModels: AIModel[] = normalizedQuery
        ? filteredModels.filter((model) => {

            const searchableFields = [
                model.name,
                model.author,
                model.task,
                model.modelId,
                (model.tags ?? []).join(" "),
            ];

            return searchableFields.some(
                (field) => normalizeText(field).includes(normalizedQuery)
            );
        })
        : filteredModels;

    // Když přesné hledání nic nenajde, nahradí ho fuzzy vyhledávání nejpodobnějších modelů
    const isFuzzySearch = normalizedQuery !== "" && exactModels.length === 0;

    const searchedModels: AIModel[] = isFuzzySearch
        ? fuzzySearch.search(searchQuery).map(({ item }) => item)
        : exactModels;

    // Zobrazuje se jen první načtené modely (24), další se přidají tlačítkem "Načíst další"
    const visibleModels = searchedModels.slice(0, visibleCount);

    // Popisky se doplňují postupně po třech, aby se negenerovalo všechno najednou.
    // Hotové se uloží a příště se jen zobrazí, takže se každý model generuje jen jednou.
    useEffect(() => {
        const missing = visibleModels.filter((model) => !model.description).slice(0, 3);

        if (missing.length === 0) {
            return;
        }

        let isCancelled = false;

        void (async () => {
            try {
                const generated = await createDescriptions(missing);

                if (isCancelled || generated.length === 0) {
                    return;
                }

                setAllModels((current) =>
                    current.map((model) => {
                        const filled = generated.find((item) => item.modelId === model.modelId);

                        return filled ? { ...model, description: filled.description } : model;
                    })
                );
            } catch (error) {
                console.error("Nepodařilo se doplnit popisky:", error);
            }
        })();

        return () => {
            isCancelled = true;
        };
    }, [visibleModels]);

    // Změní řazení výpisu modelů (výpis se načte znovu z Hugging Face)
    const handleSortChange = (newSort: ModelSortKey): void => {

        setSort(newSort);
    };


    // Přechod na stránku detailu modelu
    const handleModelClick = (
        model: AIModel
    ): void => {

        // Modely načtené živě z Hugging Face nemají databázové id, identifikátor se vezme z Hugging Face
        navigate(modelDetailUrl(model._id ?? model.modelId));

    };


    // Načte do výpisu další množství modelů
    const loadMore = (): void => {
        setVisibleCount((current) => current + MODELS_PER_LOADING);
    };


    return {
        models: visibleModels,

        totalCount: searchedModels.length,

        hasMore: searchedModels.length > visibleModels.length,

        loadMore,

        searchQuery,

        isFuzzySearch,

        filters,

        isFilterActive,

        handleFilterChange,

        resetFilters,

        sort,

        handleSortChange,

        handleModelClick,

        loading,

        hasLoaded,

        error,
    };
}


export default useModelBrowser;

