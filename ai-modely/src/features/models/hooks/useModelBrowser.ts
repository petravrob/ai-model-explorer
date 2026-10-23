import Fuse, { type IFuseOptions } from "fuse.js";
import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";

import { AIModel } from "../types";
import { SEARCH_QUERY_PARAM, modelDetailUrl } from "@/routes/paths";
import { createDescriptions, getModels, type ModelsPage } from "../api/modelsApi";
import useModelFilters from "./useModelFilters";
import type { ModelFilters } from "../filters";
import type { ModelSortKey } from "../modelSortsConfig";
import type { ModelTabKey } from "../modelTabsConfig";
import { MODELS_MAX_PAGE_SIZE, MODELS_PER_PAGE } from "../modelPagingConfig";
import { readVisibleCount, saveScrollPosition, saveVisibleCount } from "../utils/browserPageStorage";
import { buildFiltersParamsKey, readFiltersFromParams, readSortFromParams, readTabFromParams, writeSortToParams, writeTabToParams } from "../utils/modelListParams";
import { buildModelsCacheKey, readCachedModels, saveCachedModels } from "../utils/modelsCache";
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

// Kolik popisků se vyžádá najednou (server je jen přečte a chybějící zařadí do fronty)
const DESCRIPTIONS_PER_LOAD = 8;

// Popisky se na serveru generují na pozadí, takže první odpověď bývá prázdná.
// Než karta místo kostry ukáže zástupný text, zkusí se popisek ještě tolikrát znovu.
const MAX_DESCRIPTION_ATTEMPTS = 24;

// Pauza před dalším pokusem o popisky (generování na serveru chvíli trvá)
const DESCRIPTION_RETRY_DELAY_MS = 5000;

/** Načte stránky, dokud jich není aspoň targetCount (obnova po návratu z detailu). */
const loadModelsUpTo = async (
    filters: ModelFilters,
    sort: ModelSortKey,
    tab: ModelTabKey,
    targetCount: number,
    signal: AbortSignal
): Promise<ModelsPage & { consumed: number }> => {

    const models: AIModel[] = [];
    const knownIds = new Set<string>();

    // Kolik modelů už přišlo (i duplicitních) - podle toho se posouvá offset
    let consumed = 0;
    let hasMore = false;
    let cursor: string | null = null;

    while (models.length < targetCount) {

        // Víc než MODELS_MAX_PAGE_SIZE server v jednom požadavku nevrátí
        const page = await getModels(
            filters,
            sort,
            tab,
            {
                offset: consumed,
                limit: Math.min(MODELS_MAX_PAGE_SIZE, targetCount - models.length),
                cursor,
            },
            signal
        );

        consumed += page.models.length;
        cursor = page.nextCursor;

        page.models.forEach((model) => {
            if (!knownIds.has(model.modelId)) {
                knownIds.add(model.modelId);
                models.push(model);
            }
        });

        hasMore = page.hasMore;

        // Prázdná stránka znamená, že na serveru už nic dalšího není
        if (!page.hasMore || page.models.length === 0) {
            break;
        }
    }

    return { models, hasMore, nextCursor: cursor, consumed };
};

/** Odkud načíst další stránku výpisu - navázáním na kurzor, nebo od zadané pozice. */
interface NextPage {
    cursor: string | null;
    offset: number;
}

/** Obstarává logiku zobrazení seznamu modelů a přechodu na jejich detail */
function useModelBrowser() {

    const [error, setError] = useState<string | null>(null);

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

    // Klíč výpisu v paměti podle štítku, řazení a filtrů
    const modelsCacheKey = useMemo(
        () => buildModelsCacheKey(readFiltersFromParams(searchParams), sort, tab),
        [buildFiltersParamsKey(searchParams), sort, tab]
    );

    // Po návratu z detailu se místo načítací animace ukáže poslední výpis z paměti
    const [initialCachedModels] = useState(() => readCachedModels(modelsCacheKey));

    // Uložená plná sada modelů z posledního serverového načtení. Filtry ji jen zúží,
    // nesmí ji přepsat prázdným seznamem po konkrétním vyfiltrování.
    const [allModels, setAllModels] = useState<AIModel[]>(() => initialCachedModels ?? []);

    const [loading, setLoading] = useState(initialCachedModels === null);

    // Příznak dokončeného úvodního načtení: při obnově kvůli filtrům zůstane na stránce stávající výpis
    const [hasLoaded, setHasLoaded] = useState(initialCachedModels !== null);

    // První obnova z paměti běží na pozadí, bez načítací animace
    const isSilentRefreshRef = useRef(initialCachedModels !== null);

    // Naposledy zobrazené modely se drží i v referenci, aby k nim šly při obnově
    // přidat už doplněné popisky
    const shownModelsRef = useRef<AIModel[]>(allModels);

    useEffect(() => {
        shownModelsRef.current = allModels;
    }, [allModels]);

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

    const setTab = (nextTab: ModelTabKey): void => {

        // Změna štítku - nové výsledky se ukážou od začátku stránky
        if (nextTab !== tab) {
            window.scrollTo({ top: 0, left: 0 });
        }

        updateListParams((params) => writeTabToParams(params, nextTab));
    };

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

    // Jestli má server další modely, rozhoduje odpověď API - tlačítko se podle toho
    // zobrazí i potom, co jsou zobrazené všechny dosud načtené modely
    const [hasMore, setHasMore] = useState(true);

    // Načítání další stránky tlačítkem (výpis zůstává vidět, jen se tlačítko vypne)
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [loadMoreError, setLoadMoreError] = useState<string | null>(null);
    const isLoadingMoreRef = useRef(false);

    // Další stránka začíná tam, kde skončila poslední úspěšně načtená
    const nextPageRef = useRef<NextPage>({ cursor: null, offset: 0 });

    // Počet načtených modelů se průběžně ukládá, aby se po návratu na stránku obnovil
    // celý dříve rozbalený výpis
    useEffect(() => {
        // Ukládá se až hotový výpis, ne mezistav během načítání (jinak by se mohl
        // uložit počet modelů z předchozích filtrů)
        if (loading) {
            return;
        }

        saveVisibleCount(location.key, allModels.length);
    }, [location.key, allModels.length, loading]);

    // Kolik modelů se má načíst při prvním požadavku: výpis z paměti (návrat z detailu)
    // nebo dříve uložený počet zobrazených modelů
    const initialPageSizeRef = useRef(
        Math.max(
            MODELS_PER_PAGE,
            initialCachedModels?.length ?? 0,
            readVisibleCount(location.key, MODELS_PER_PAGE)
        )
    );

    // Úvodní načtení po otevření stránky neresetuje rozbalený výpis - může jít
    // o návrat z detailu, kdy se obnovuje celý dříve načtený seznam
    const isInitialFetchRef = useRef(true);


    // Načtení modelů podle zvolených filtrů (s filtry se filtruje přímo na serveru z Hugging Face)
    useEffect(() => {

        const requestId = ++latestRequestIdRef.current;
        const controller = new AbortController();
        const isInitialFetch = isInitialFetchRef.current;

        // Nový výpis (filtry, řazení, štítek) začíná znovu od začátku
        nextPageRef.current = { cursor: null, offset: 0 };
        setLoadMoreError(null);

        // Staré modely zůstanou vidět, dokud nedorazí nové (obnova z paměti běží bez animace)
        if (!isSilentRefreshRef.current) {
            setLoading(true);
        }

        setError(null);

        const loadModels = async (): Promise<void> => {

            try {

                // Po návratu z detailu se obnoví celý dříve rozbalený výpis, jinak stačí první stránka
                const targetCount = isInitialFetch
                    ? Math.max(MODELS_PER_PAGE, initialPageSizeRef.current)
                    : MODELS_PER_PAGE;

                const page = await loadModelsUpTo(
                    filters,
                    sort,
                    tab,
                    targetCount,
                    controller.signal
                );

                if (controller.signal.aborted || requestId !== latestRequestIdRef.current) {
                    return;
                }

                // Popisky doplněné za běhu se přidají do výsledků
                const knownDescriptions = new Map<string, string>();

                shownModelsRef.current.forEach((model) => {
                    if (model.description?.trim()) {
                        knownDescriptions.set(model.modelId, model.description);
                    }
                });

                const mergedModels = page.models.map((model) =>
                    !model.description?.trim() && knownDescriptions.has(model.modelId)
                        ? { ...model, description: knownDescriptions.get(model.modelId) ?? null }
                        : model
                );

                // Reference hned, aby na ni navázalo i rychlé kliknutí na další stránku
                shownModelsRef.current = mergedModels;

                setAllModels(mergedModels);

                // Jestli existují další modely, říká server
                setHasMore(page.hasMore);

                // Další tlačítko naváže tam, kde tato stránka skončila
                nextPageRef.current = { cursor: page.nextCursor, offset: page.consumed };

                // Uloží se do paměti, ať se po návratu z detailu zobrazí hned
                saveCachedModels(modelsCacheKey, mergedModels);

                setHasLoaded(true);

                // Úvodní načtení je hotové, další změna filtru začíná zase první stránkou
                if (isInitialFetch) {
                    isInitialFetchRef.current = false;
                }

            } catch (error) {

                if (controller.signal.aborted || requestId !== latestRequestIdRef.current) {
                    return;
                }

                console.error(
                    "Nepodařilo se načíst modely:",
                    error
                );

                // Obnova na pozadí selhala, výpis z paměti zůstane zobrazený
                if (isSilentRefreshRef.current) {
                    // Další stránka naváže na zobrazený výpis
                    nextPageRef.current = { cursor: null, offset: shownModelsRef.current.length };

                    return;
                }

                const errorMessage =
                    error instanceof Error
                        ? error.message
                        : "Nepodařilo se načíst modely.";

                setError(errorMessage);

            } finally {

                if (controller.signal.aborted || requestId !== latestRequestIdRef.current) {
                    return;
                }

                // Obnova z paměti doběhla, další změna filtru animaci zase ukáže
                isSilentRefreshRef.current = false;

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

    }, [filters, sort, tab, modelsCacheKey]);

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

    // Zobrazují se všechny načtené modely; další stránka se dotáhne tlačítkem "Načíst další"
    const visibleModels = searchedModels;

    // Modely, u kterých už doplnění popisku proběhlo (i když popisek nakonec nedorazil).
    // Karta podle toho pozná, že místo kostry má zobrazit zástupný text.
    const [finishedDescriptionIds, setFinishedDescriptionIds] = useState<string[]>([]);

    // Popisky, které se právě doplňují, aby se stejný popisek nežádal víckrát
    const requestedDescriptionIdsRef = useRef(new Set<string>());

    // Popisky čekající na dogenerování na serveru - po pauze se o ně zkusí znovu
    const descriptionCooldownIdsRef = useRef(new Set<string>());

    // Počty pokusů o popisek pro jednotlivé modely (po vyčerpání se ukáže zástupný text)
    const descriptionAttemptsRef = useRef(new Map<string, number>());

    // Odložený pokus o popisky po pauze a přepínač, který efekt po pauze spustí znovu
    const descriptionRetryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const [descriptionRetryToken, setDescriptionRetryToken] = useState(0);

    // Při odchodu ze stránky se odložený pokus zruší
    useEffect(() => () => {
        if (descriptionRetryTimerRef.current) {
            clearTimeout(descriptionRetryTimerRef.current);
        }
    }, []);

    // Popisky se doplňují postupně po menších dávkách. Server odpovídá hned - vrátí hotové popisky
    // a chybějící si zařadí ke generování na pozadí, takže se o ně po pauze zkusí znovu.
    useEffect(() => {

        // Vyžádaná dávka popisků se eviduje, aby se stejný popisek nežádal víckrát
        const requestedIds = requestedDescriptionIdsRef.current;

        // Další dávka se vyžádá, až když předchozí dorazí
        if (requestedIds.size > 0) {
            return;
        }

        const cooldownIds = descriptionCooldownIdsRef.current;

        const missing = visibleModels
            .filter((model) =>
                !model.description?.trim() &&
                !finishedDescriptionIds.includes(model.modelId) &&
                !cooldownIds.has(model.modelId)
            )
            .slice(0, DESCRIPTIONS_PER_LOAD);

        if (missing.length === 0) {
            return;
        }

        const missingIds = missing.map((model) => model.modelId);

        missingIds.forEach((modelId) => requestedIds.add(modelId));

        void (async () => {

            let receivedIds = new Set<string>();

            try {

                const generated = await createDescriptions(missing);

                receivedIds = new Set(generated.map((item) => item.modelId));

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

                // Hotové popisky příště netřeba řešit
                receivedIds.forEach((modelId) => descriptionAttemptsRef.current.delete(modelId));

                const exhaustedIds: string[] = [];
                const retryIds: string[] = [];

                // Prázdná odpověď znamená, že se popisek teprve generuje na pozadí
                for (const modelId of missingIds.filter((id) => !receivedIds.has(id))) {
                    const attempt = (descriptionAttemptsRef.current.get(modelId) ?? 0) + 1;

                    descriptionAttemptsRef.current.set(modelId, attempt);

                    if (attempt >= MAX_DESCRIPTION_ATTEMPTS) {
                        exhaustedIds.push(modelId);
                    } else {
                        retryIds.push(modelId);
                        cooldownIds.add(modelId);
                    }
                }

                // Karty, které pokusy vyčerpaly, už na popisek nečekají
                // (místo kostry se u nich zobrazí zástupný text)
                if (exhaustedIds.length > 0) {
                    setFinishedDescriptionIds((current) => [...new Set([...current, ...exhaustedIds])]);
                }

                // Odložený pokus se plánuje jen jeden - až doběhne, uvolní z pauzy všechny
                // čekající popisky a efekt se spustí znovu
                if (retryIds.length > 0 && !descriptionRetryTimerRef.current) {
                    descriptionRetryTimerRef.current = setTimeout(() => {
                        descriptionRetryTimerRef.current = null;
                        descriptionCooldownIdsRef.current.clear();
                        setDescriptionRetryToken((current) => current + 1);
                    }, DESCRIPTION_RETRY_DELAY_MS);
                }

                // Dokud jsou další chybějící popisky mimo pauzu, vyžádá se hned další dávka
                setDescriptionRetryToken((current) => current + 1);

            }

        })();

    }, [visibleModels, finishedDescriptionIds, descriptionRetryToken]);

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

    // Načte ze serveru další stránku modelů a připojí ji k výpisu
    const loadMore = async (): Promise<void> => {

        // Dvojklik nebo načítání během obnovy výpisu se ignoruje
        if (isLoadingMoreRef.current || loading || !hasMore) {
            return;
        }

        const requestId = latestRequestIdRef.current;
        const nextPage = nextPageRef.current;

        isLoadingMoreRef.current = true;
        setIsLoadingMore(true);
        setLoadMoreError(null);

        try {

            const page = await getModels(filters, sort, tab, {
                offset: nextPage.offset,
                limit: MODELS_PER_PAGE,
                cursor: nextPage.cursor,
            });

            // Mezitím se změnily filtry, řazení nebo štítek - stránka už do výpisu nepatří
            if (requestId !== latestRequestIdRef.current) {
                return;
            }

            // Když se výpis mezitím obnovil, stránka se jen připojí a duplicity se zahodí
            if (nextPageRef.current === nextPage) {
                nextPageRef.current = {
                    cursor: page.nextCursor,
                    offset: nextPage.offset + page.models.length,
                };

                // Prázdná stránka načítání ukončí, ať tlačítko neopakuje stejný požadavek
                setHasMore(page.hasMore && page.models.length > 0);
            }

            const currentModels = shownModelsRef.current;
            const knownIds = new Set(currentModels.map((model) => model.modelId));
            const addedModels = page.models.filter((model) => !knownIds.has(model.modelId));
            const mergedModels = [...currentModels, ...addedModels];

            // Reference hned, aby na ni navázalo i rychlé kliknutí na další stránku
            shownModelsRef.current = mergedModels;

            setAllModels(mergedModels);

            // Uloží se do paměti, ať se po návratu z detailu zobrazí hned
            saveCachedModels(modelsCacheKey, mergedModels);

        } catch (error) {

            if (requestId !== latestRequestIdRef.current) {
                return;
            }

            console.error("Nepodařilo se načíst další modely:", error);

            setLoadMoreError("Další modely se nepodařilo načíst. Zkuste to prosím znovu.");

        } finally {

            isLoadingMoreRef.current = false;

            setIsLoadingMore(false);

        }
    };

    return {
        models: visibleModels,
        pendingDescriptionIds,
        hasMore,
        loadMore,
        isLoadingMore,
        loadMoreError,
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
