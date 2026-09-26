import { useParams } from "react-router-dom";

import "./ModelDetailPage.css";

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
                <div className="model-detail-page">
                    <div className="model-detail-page__toolbar">
                        <Button variant="outline" onClick={handleBack}>
                            ← Zpět na seznam
                        </Button>
                    </div>

                    <PageMessage>
                        {error ?? "Model nebyl nalezen."}
                    </PageMessage>
                </div>
            </PageContainer>
        );
    }

    return (
        <PageContainer>
            <div className="model-detail-page">
                <div className="model-detail-page__toolbar">
                    <Button variant="outline" onClick={handleBack}>
                        ← Zpět na seznam
                    </Button>
                </div>

                <ModelDetail model={model} />
            </div>
        </PageContainer>
    );
}

export default ModelDetailPage;
