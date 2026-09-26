import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { AIModel, ModelInsights } from "../types";
import { ROUTE_PATHS } from "@/routes/paths";
import { getModel, getModelInsights } from "../api/modelsApi";

/** Obstarává logiku stránky detailu modelu */
function useModelDetail(modelId: string | undefined) {

    const [model, setModel] =
        useState<AIModel | null>(null);

    // Přehledy z dokumentace modelu - připravují se na pozadí a stránka funguje i bez nich
    const [insights, setInsights] =
        useState<ModelInsights | null>(null);

    const [isInsightsLoading, setInsightsLoading] =
        useState<boolean>(false);

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

    // Přehledy z dokumentace se připravují zvlášť, až pro otevřený model
    useEffect(() => {
        if (!modelId) {
            return;
        }

        let cancelled = false;

        setInsights(null);
        setInsightsLoading(true);

        getModelInsights(modelId)
            .then((data) => {
                if (!cancelled) {
                    setInsights(data);
                }
            })
            .catch((error) => console.error("Přehledy z dokumentace se nepodařilo připravit:", error))
            .finally(() => {
                if (!cancelled) {
                    setInsightsLoading(false);
                }
            });

        return () => {
            cancelled = true;
        };
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

        insights,
        isInsightsLoading,

        handleBack,

        loading,

        error,
    };
}


export default useModelDetail;
