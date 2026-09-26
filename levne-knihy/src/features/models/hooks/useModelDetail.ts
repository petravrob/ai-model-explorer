import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { AIModel } from "../types";
import { ROUTE_PATHS } from "@/routes/paths";
import { createDescriptions, getModel } from "../api/modelsApi";

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

    // Popisek k modelu, který ho ještě nemá (generuje se jen pro zobrazený detail)
    useEffect(() => {
        if (!model || model.description) {
            return;
        }

        createDescriptions([model])
            .then(([generated]) => {
                if (generated) {
                    setModel((current) =>
                        current?.modelId === generated.modelId
                            ? { ...current, description: generated.description }
                            : current
                    );
                }
            })
            .catch((error) => console.error("Popisek modelu se nepodařilo vygenerovat:", error));
    }, [model]);

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
