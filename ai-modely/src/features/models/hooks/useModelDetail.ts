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


    // Detail modelu se vždy otevře od začátku stránky (od shora, bez scrollu)
    useEffect(() => {
        window.scrollTo(0, 0);
    }, [modelId]);

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

    // Přehledy z dokumentace se připravují zvlášť, až pro otevřený model.
    // Server odpovídá hned - hotové přehledy vrátí, chybějící si zařadí ke zpracování
    // na pozadí, takže se o ně po pauze zkusí znovu.
    useEffect(() => {
        if (!modelId) {
            return;
        }

        // Při prvním otevření detailu přehledy typicky ještě nejsou hotové
        const MAX_INSIGHTS_ATTEMPTS = 4;
        const INSIGHTS_RETRY_DELAY_MS = 15000;

        let cancelled = false;
        let retryTimer: ReturnType<typeof setTimeout> | null = null;

        setInsights(null);
        setInsightsLoading(true);

        const loadInsights = async (attempt: number): Promise<void> => {

            try {

                const data = await getModelInsights(modelId);

                if (cancelled) {
                    return;
                }

                // Přehledy se připravují na pozadí - prázdná odpověď se po pauze zkusí znovu
                if (data === null && attempt < MAX_INSIGHTS_ATTEMPTS) {
                    retryTimer = setTimeout(() => {
                        void loadInsights(attempt + 1);
                    }, INSIGHTS_RETRY_DELAY_MS);

                    return;
                }

                setInsights(data);

            } catch (error) {

                console.error("Přehledy z dokumentace se nepodařilo připravit:", error);

            }

            if (!cancelled) {
                setInsightsLoading(false);
            }

        };

        void loadInsights(1);

        return () => {
            cancelled = true;

            if (retryTimer) {
                clearTimeout(retryTimer);
            }
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
