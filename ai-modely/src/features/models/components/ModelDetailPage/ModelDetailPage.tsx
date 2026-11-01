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

    // Tlačítko zpět se na stránce ukazuje jen tam, kde chybí tlačítko zpět prohlížeče.
    // Na telefonu a tabletu drží fixně u dolního okraje - viditelnost řeší ModelDetailPage.css
    const backToolbar = (
        <div className="model-detail-page__toolbar">
            <Button
                variant="outline"
                onClick={handleBack}
            >
                Zpět na výpis modelů
            </Button>
        </div>
    );


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
                    {backToolbar}

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
                {backToolbar}

                <ModelDetail
                    model={model}
                    insights={insights}
                />
            </div>
        </PageContainer>
    );
}

export default ModelDetailPage;

