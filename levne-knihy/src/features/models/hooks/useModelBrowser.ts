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

    // Hledaný výraz z URL (např. „/?q=gpt“)
    const searchQuery = searchParams.get(SEARCH_QUERY_PARAM) ?? "";


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

    // Filtrování podle hledaného výrazu (název i autor, bez rozlišení velikosti písmen a diakritiky)
    const normalizedQuery = normalizeText(searchQuery);

    const searchedModels: AIModel[] = normalizedQuery
        ? models.filter(
            (model) =>
                normalizeText(model.name).includes(normalizedQuery) ||
                normalizeText(model.author).includes(normalizedQuery)
        )
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

