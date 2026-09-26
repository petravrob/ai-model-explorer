import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { AIModel, ModelCardContent } from "../types";
import { ROUTE_PATHS } from "@/routes/paths";
import { createDescriptions, getModel, getModelCard } from "../api/modelsApi";

/** Obstarává logiku stránky detailu modelu */
function useModelDetail(modelId: string | undefined) {

    const [model, setModel] =
        useState<AIModel | null>(null);

    // Text model card (README) z Hugging Face – načítá se zvlášť, až pro otevřený detail
    const [card, setCard] =
        useState<ModelCardContent | null>(null);

    const [isCardLoading, setCardLoading] =
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

    // Text model card se načítá zvlášť (je obsáhlý a do výpisu modelů nepatří)
    useEffect(() => {
        if (!modelId) {
            return;
        }

        let cancelled = false;

        setCard(null);
        setCardLoading(true);

        getModelCard(modelId)
            .then((data) => {
                if (!cancelled) {
                    setCard(data);
                }
            })
            .catch((error) => console.error("Text model card se nepodařilo načíst:", error))
            .finally(() => {
                if (!cancelled) {
                    setCardLoading(false);
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

        card,
        isCardLoading,

        handleBack,

        loading,

        error,
    };
}


export default useModelDetail;
