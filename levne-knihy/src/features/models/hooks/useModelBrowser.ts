import Fuse, { type IFuseOptions } from "fuse.js";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import { AIModel } from "../types";
import { SEARCH_QUERY_PARAM, modelDetailUrl } from "@/routes/paths";
import { getModels } from "../api/modelsApi";
import useModelFilters from "./useModelFilters";

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

/** Obstarává logiku zobrazení seznamu modelů a přechodu na jejich detail */
function useModelBrowser() {

    const [models, setModels] = useState<AIModel[]>([]);

    const [loading, setLoading] =
        useState<boolean>(true);

    const [error, setError] =
        useState<string | null>(null);

    // Příznak dokončeného úvodního načtení – při obnově kvůli filtrům zůstane na stránce stávající výpis
    const [hasLoaded, setHasLoaded] =
        useState<boolean>(false);

    const navigate = useNavigate();

    const [searchParams] = useSearchParams();

    // Hledaný výraz z URL (např. „/?q=gpt“), oříznutý o okrajové mezery
    const searchQuery = (searchParams.get(SEARCH_QUERY_PARAM) ?? "").trim();

    // Filtry z levého panelu, které zúží výpis před samotným hledáním
    const {
        filters,
        isFilterActive,
        handleFilterChange,
        resetFilters,
        filteredModels,
    } = useModelFilters(models);


    // Načtení modelů podle zvolených filtrů (s filtry se filtruje přímo na serveru z Hugging Face)
    // TODO: prověřit aktuální práci s databází, možná to upravit
    useEffect(() => {

        // Zastaralá odpověď ze dřívějšího načtení se zahodí
        let cancelled = false;

        // Obnova se ohlásí hned (i během čekání na sloučení změn filtrů),
        // dříve načtené modely přitom zůstanou zobrazené, dokud nedorazí nová data
        setLoading(true);
        setError(null);

        const loadModels = async (): Promise<void> => {

            try {

                const data = await getModels(filters);

                if (!cancelled) {
                    setModels(data);
                    setHasLoaded(true);
                }

            } catch (error) {

                console.error(
                    "Nepodařilo se načíst modely:",
                    error
                );

                const errorMessage =
                    error instanceof Error
                        ? error.message
                        : "Nepodařilo se načíst modely.";

                if (!cancelled) {
                    setError(errorMessage);
                }

            } finally {

                if (!cancelled) {
                    setLoading(false);
                }

            }

        };

        const timeoutId = setTimeout(loadModels, FILTERS_FETCH_DELAY_MS);

        return () => {
            cancelled = true;
            clearTimeout(timeoutId);
        };

    }, [filters]);

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
                model.tags.join(" "),
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


    // Přechod na stránku detailu modelu
    const handleModelClick = (
        model: AIModel
    ): void => {

        // Modely načtené živě z Hugging Face nemají databázové id, identifikátor se vezme z Hugging Face
        navigate(modelDetailUrl(model._id ?? model.modelId));

    };


    return {
        models: searchedModels,

        searchQuery,

        isFuzzySearch,

        filters,

        isFilterActive,

        handleFilterChange,

        resetFilters,

        handleModelClick,

        loading,

        hasLoaded,

        error,
    };
}


export default useModelBrowser;

