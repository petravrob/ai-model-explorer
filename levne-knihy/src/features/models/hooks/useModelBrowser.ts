import Fuse, { type IFuseOptions } from "fuse.js";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import { AIModel } from "../types";
import { SEARCH_QUERY_PARAM, modelDetailUrl } from "@/routes/paths";
import { getModels } from "../api/modelsApi";

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

/** Obstarává logiku zobrazení seznamu modelů a přechodu na jejich detail */
function useModelBrowser() {

    const [models, setModels] = useState<AIModel[]>([]);

    const [loading, setLoading] =
        useState<boolean>(true);

    const [error, setError] =
        useState<string | null>(null);

    const navigate = useNavigate();

    const [searchParams] = useSearchParams();

    // Hledaný výraz z URL (např. „/?q=gpt“), oříznutý o okrajové mezery
    const searchQuery = (searchParams.get(SEARCH_QUERY_PARAM) ?? "").trim();


    // Načtení všech modelů
    useEffect(() => {

        const loadModels = async (): Promise<void> => {

            try {

                setLoading(true);
                setError(null);

                const data = await getModels();

                setModels(data);

            } catch (error) {

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

                setLoading(false);

            }

        };

        loadModels();

    }, []);

    // Fuzzy vyhledávání nad načtenými modely (index se sestaví jen při načtení nebo změně dat)
    const fuzzySearch = useMemo(
        () => new Fuse(models, FUSE_OPTIONS),
        [models]
    );

    // Přesné hledání podle hledaného výrazu (název, autor, úloha, identifikátor i štítky,
    // bez rozlišení velikosti písmen a diakritiky)
    const normalizedQuery = normalizeText(searchQuery);

    const exactModels: AIModel[] = normalizedQuery
        ? models.filter((model) => {

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
        : models;

    // Když přesné hledání nic nenajde, nahradí ho fuzzy vyhledávání nejpodobnějších modelů
    const isFuzzySearch = normalizedQuery !== "" && exactModels.length === 0;

    const searchedModels: AIModel[] = isFuzzySearch
        ? fuzzySearch.search(searchQuery).map(({ item }) => item)
        : exactModels;


    // Přechod na stránku detailu modelu
    const handleModelClick = (
        model: AIModel
    ): void => {

        navigate(modelDetailUrl(model._id));

    };


    return {
        models: searchedModels,

        searchQuery,

        isFuzzySearch,

        handleModelClick,

        loading,

        error,
    };
}


export default useModelBrowser;

