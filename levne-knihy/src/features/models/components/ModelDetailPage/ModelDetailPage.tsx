import { useParams } from "react-router-dom";

import "./ModelDetailPage.css";

import useModelDetail from "../../hooks/useModelDetail";
import ModelDetail from "../ModelDetail/ModelDetail";
import { Button, PageContainer, PageMessage } from "@/ui";

/** Horní lišta stránky detailu s návratem na seznam modelů. */
function BackToolbar({ onBack }: { onBack: () => void }) {
    return (
        <div className="model-detail-page__toolbar">
            <Button variant="outline" onClick={onBack}>
                ← Zpět na seznam
            </Button>
        </div>
    );
}

/** Stránka s detailem modelu. */
function ModelDetailPage() {

    const { modelId } = useParams<{
        modelId: string;
    }>();

    const {
        model,

        insights,

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
                    <BackToolbar onBack={handleBack} />

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
                <BackToolbar onBack={handleBack} />

                <ModelDetail
                    model={model}
                    insights={insights}
                />
            </div>
        </PageContainer>
    );
}

export default ModelDetailPage;

