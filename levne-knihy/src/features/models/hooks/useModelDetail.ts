import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { AIModel } from "../types";
import { ROUTE_PATHS } from "@/routes/paths";
import { getModel } from "../api/modelsApi";

/** Obstarává logiku stránky detailu modelu */
function useModelDetail(modelId: string | undefined) {

    const [model, setModel] =
        useState<AIModel | null>(null);

    const [loading, setLoading] =
        useState<boolean>(true);

    const [error, setError] =
        useState<string | null>(null);

    const navigate = useNavigate();


    // Načtení modelu podle identifikátoru v adrese
    useEffect(() => {

        const loadModel = async (): Promise<void> => {

            if (!modelId) {
                setModel(null);
                setLoading(false);
                return;
            }

            try {

                setLoading(true);
                setError(null);

                const data = await getModel(modelId);

                setModel(data);

            } catch (error) {

                console.error(
                    "Nepodařilo se načíst model:",
                    error
                );

                const errorMessage =
                    error instanceof Error
                        ? error.message
                        : "Nepodařilo se načíst model.";

                setError(errorMessage);

            } finally {

                setLoading(false);

            }

        };

        loadModel();

    }, [modelId]);

    // Návrat zpět na předchozí stránku (nebo na seznam modelů)
    const handleBack = (): void => {

        if (window.history.state && window.history.state.idx > 0) {
            navigate(-1);
        } else {
            navigate(ROUTE_PATHS.home);
        }

    };


    return {
        model,

        handleBack,

        loading,

        error,
    };
}


export default useModelDetail;
