import Fuse, { type IFuseOptions } from "fuse.js";
import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";

import { AIModel } from "../types";
import { SEARCH_QUERY_PARAM, modelDetailUrl } from "@/routes/paths";
import { createDescriptions, getModels } from "../api/modelsApi";
import useModelFilters from "./useModelFilters";
import type { ModelSortKey } from "../modelSortsConfig";
import type { ModelTabKey } from "../modelTabsConfig";
import { readVisibleCount, saveScrollPosition, saveVisibleCount } from "../utils/browserPageStorage";
import { readSortFromParams, readTabFromParams, writeSortToParams, writeTabToParams } from "../utils/modelListParams";
import { applyTab } from "../utils/modelTabUtils";

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

// Kolik popisků se vyžádá najednou (stejný počet jich na jedno vyžádání vygeneruje i server)
const DESCRIPTIONS_PER_LOAD = 3;

/** Obstarává logiku zobrazení seznamu modelů a přechodu na jejich detail */
function useModelBrowser() {

    // Uložená plná sada modelů z posledního serverového načtení. Filtry ji jen zúží,
    // nesmí ji přepsat prázdným seznamem po konkrétním vyfiltrování.
    const [allModels, setAllModels] = useState<AIModel[]>([]);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState<string | null>(null);

    // Příznak dokončeného úvodního načtení: při obnově kvůli filtrům zůstane na stránce stávající výpis
    const [hasLoaded, setHasLoaded] = useState(false);

    const navigate = useNavigate();

    // Klíč záznamu v historii - podle něj se po návratu z detailu obnoví prohlížeč modelů
    const location = useLocation();

    const [searchParams, setSearchParams] = useSearchParams();
    const latestRequestIdRef = useRef(0);

    // Hledaný výraz z URL (např. /?q=gpt), oříznutý o okrajové mezery
    const searchQuery = (searchParams.get(SEARCH_QUERY_PARAM) ?? "").trim();

    // Zvolený štítek, řazení i filtry se drží v URL, aby zůstaly nastavené i po návratu z detailu modelu
    const tab = readTabFromParams(searchParams);
    const sort = readSortFromParams(searchParams);

    /** Zapíše do URL novou hodnotu štítku nebo řazení a ostatní parametry (filtry, hledání) nechá být. */
    const updateListParams = (
        writeParams: (params: URLSearchParams) => void
    ): void => {

        setSearchParams(
            (currentParams) => {

                const params = new URLSearchParams(currentParams);

                writeParams(params);

                return params;
            },
            { replace: true }
        );
    };

    const setTab = (nextTab: ModelTabKey): void =>
        updateListParams((params) => writeTabToParams(params, nextTab));

    const setSort = (nextSort: ModelSortKey): void =>
        updateListParams((params) => writeSortToParams(params, nextSort));

    // Štítek vyfiltruje načtené modely, teprve nad ním se použijí filtry z levého panelu
    const tabModels = useMemo(
        () => applyTab(allModels, tab),
        [allModels, tab]
    );

    // Filtry z levého panelu, které zúží výpis před samotným hledáním
    const {
        filters,
        isFilterActive,
        activeFilterCount,
        handleFilterChange,
        resetFilters,
        filteredModels,
    } = useModelFilters(tabModels);

    const [visibleCount, setVisibleCount] = useState(() =>
        readVisibleCount(location.key, MODELS_PER_LOADING)
    );

    // Počet zobrazených modelů se průběžně ukládá, aby se dal po návratu na stránku obnovit
    useEffect(() => {
        saveVisibleCount(location.key, visibleCount);
    }, [location.key, visibleCount]);

    // Úvodní načtení po otevření stránky počet zobrazených modelů neresetuje - může jít
    // o návrat z detailu, kdy se rozbalený výpis obnovuje z uloženého stavu
    const isInitialFetchRef = useRef(true);

    // Načtení modelů podle zvolených filtrů (s filtry se filtruje přímo na serveru z Hugging Face)
    useEffect(() => {

        const requestId = ++latestRequestIdRef.current;
        const controller = new AbortController();

        // Obnova se ohlásí hned (i během čekání na sloučení změn filtrů),
        // dříve načtené modely přitom zůstanou zobrazené, dokud nedorazí nová data
        setLoading(true);
        setError(null);

        const loadModels = async (): Promise<void> => {

            try {

                const data = await getModels(filters, sort, tab, controller.signal);

                if (controller.signal.aborted || requestId !== latestRequestIdRef.current) {
                    return;
                }

                setAllModels(data);
                setHasLoaded(true);

                // Nový výpis začíná prvními načtenými modely - kromě úvodního načtení,
                // kdy se počet obnovuje z uloženého stavu (návrat z detailu modelu)
                if (isInitialFetchRef.current) {
                    isInitialFetchRef.current = false;
                } else {
                    setVisibleCount(MODELS_PER_LOADING);
                }

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

    }, [filters, sort, tab]);

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

    // Modely, u kterých už doplnění popisku proběhlo (i když popisek nakonec nedorazil).
    // Karta podle toho pozná, že místo kostry má zobrazit zástupný text.
    const [finishedDescriptionIds, setFinishedDescriptionIds] = useState<string[]>([]);

    // Popisky, které se právě doplňují, aby se stejný popisek nežádal víckrát
    const requestedDescriptionIdsRef = useRef(new Set<string>());

    // Popisky se doplňují postupně po třech, aby se negenerovalo všechno najednou.
    // Hotové se uloží a příště se jen zobrazí, takže se každý model generuje jen jednou.
    useEffect(() => {

        // Vyžádaná dávka popisků se eviduje, aby se stejný popisek nežádal víckrát
        const requestedIds = requestedDescriptionIdsRef.current;

        // Další dávka se vyžádá, až když předchozí dorazí (server jich víc najednou negeneruje)
        if (requestedIds.size > 0) {
            return;
        }

        const missing = visibleModels
            .filter((model) =>
                !model.description?.trim() &&
                !finishedDescriptionIds.includes(model.modelId)
            )
            .slice(0, DESCRIPTIONS_PER_LOAD);

        if (missing.length === 0) {
            return;
        }

        const missingIds = missing.map((model) => model.modelId);

        missingIds.forEach((modelId) => requestedIds.add(modelId));

        void (async () => {

            try {

                const generated = await createDescriptions(missing);

                if (generated.length > 0) {
                    setAllModels((current) =>
                        current.map((model) => {
                            const filled = generated.find((item) => item.modelId === model.modelId);

                            return filled ? { ...model, description: filled.description } : model;
                        })
                    );
                }

            } catch (error) {

                console.error("Nepodařilo se doplnit popisky:", error);

            } finally {

                missingIds.forEach((modelId) => requestedIds.delete(modelId));

                // Vyřízená dávka se ohlásí: karty, které popisek nedostaly, už na něj nečekají
                // (místo kostry se u nich zobrazí zástupný text) a vyžádá se další dávka
                setFinishedDescriptionIds((current) => [...new Set([...current, ...missingIds])]);

            }

        })();

    }, [visibleModels, finishedDescriptionIds]);

    // Modely, kterým se popisek teprve generuje: karta za ně drží stejně velký prostor, jako
    // zabere hotový text, takže se výpis při doplňování popisků nepřeskupuje
    const pendingDescriptionIds = useMemo(
        () => visibleModels
            .filter((model) => !model.description?.trim() && !finishedDescriptionIds.includes(model.modelId))
            .map((model) => model.modelId),
        [visibleModels, finishedDescriptionIds]
    );

    // Přechod na stránku detailu modelu
    const handleModelClick = (
        model: AIModel
    ): void => {

        // Pozice scrollu se uloží ještě před navigací
        saveScrollPosition(location.key, window.scrollY);

        // Modely načtené živě z Hugging Face nemají databázové id, identifikátor se vezme z Hugging Face
        navigate(modelDetailUrl(model._id ?? model.modelId));

    };

    // Načte do výpisu další množství modelů
    const loadMore = (): void => {
        setVisibleCount((current) => current + MODELS_PER_LOADING);
    };

    return {
        models: visibleModels,
        pendingDescriptionIds,
        hasMore: searchedModels.length > visibleModels.length,
        loadMore,
        searchQuery,
        isFuzzySearch,
        filters,
        isFilterActive,
        activeFilterCount,
        handleFilterChange,
        resetFilters,
        sort,
        setSort,
        tab,
        setTab,
        handleModelClick,
        loading,
        hasLoaded,
        error,
    };
}

export default useModelBrowser;
