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
                <ModelDetail
                    model={model}
                    insights={insights}
                />
            </div>
        </PageContainer>
    );
}

export default ModelDetailPage;

