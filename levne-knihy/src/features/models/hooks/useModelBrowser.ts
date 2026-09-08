import { useEffect, useState } from "react";
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

    // Filtrování podle hledaného výrazu (název, autor, úloha, identifikátor i štítky,
    // bez rozlišení velikosti písmen a diakritiky)
    const normalizedQuery = normalizeText(searchQuery);

    const searchedModels: AIModel[] = normalizedQuery
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


    // Přechod na stránku detailu modelu
    const handleModelClick = (
        model: AIModel
    ): void => {

        navigate(modelDetailUrl(model._id));

    };


    return {
        models: searchedModels,

        searchQuery,

        handleModelClick,

        loading,

        error,
    };
}


export default useModelBrowser;

