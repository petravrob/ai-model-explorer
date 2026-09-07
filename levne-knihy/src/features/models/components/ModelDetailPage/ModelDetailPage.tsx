import { useParams } from "react-router-dom";

import useModelDetail from "../../hooks/useModelDetail";
import ModelDetail from "../ModelDetail/ModelDetail";
import { Button, PageContainer, PageMessage } from "@/ui";

/** Stránka s detailem modelu. */
function ModelDetailPage() {

    const { modelId } = useParams<{
        modelId: string;
    }>();

    const {
        model,

        handleBack,

        loading,
        error,
    } = useModelDetail(modelId);


    if (loading) {
        return (
            <PageContainer>
                <PageMessage>Načítání modelu...</PageMessage>
            </PageContainer>
        );
    }

    if (error || !model) {
        return (
            <PageContainer>
                <Button variant="outline" onClick={handleBack}>
                    Zpět na seznam
                </Button>

                <PageMessage>
                    {error ?? "Model nebyl nalezen."}
                </PageMessage>
            </PageContainer>
        );
    }

    return (
        <PageContainer>
            <Button variant="outline" onClick={handleBack}>
                Zpět na seznam
            </Button>

            <ModelDetail model={model} />
        </PageContainer>
    );
}

export default ModelDetailPage;
