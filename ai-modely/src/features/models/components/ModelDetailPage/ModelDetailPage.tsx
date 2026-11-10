import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

import "./ModelDetailPage.css";

import useModelDetail from "../../hooks/useModelDetail";
import ModelDetail from "../ModelDetail/ModelDetail";
import { Button, PageContainer, PageMessage } from "@/ui";

/** Stránka s detailem modelu. */
function ModelDetailPage() {
    const { t } = useTranslation("models");

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
                {t("detailPage.back")}
            </Button>
        </div>
    );


    if (loading) {
        return (
            <PageContainer>
                <PageMessage>{t("detailPage.loading")}</PageMessage>
            </PageContainer>
        );
    }

    if (error || !model) {
        return (
            <PageContainer>
                <div className="model-detail-page">
                    {backToolbar}

                    <PageMessage>
                        {error ?? t("detailPage.notFound")}
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

