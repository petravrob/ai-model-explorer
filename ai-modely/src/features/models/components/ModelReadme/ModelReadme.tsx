import "./ModelReadme.css";

import { useTranslation } from "react-i18next";

import { SectionTitle } from "@/ui";

import renderMarkdown from "./renderMarkdown";

/** Zobrazí text model card tak, jak ho má model na Hugging Face. */
function ModelReadme({ modelId, content }: { modelId: string; content: string }) {
    const { t } = useTranslation("models");

    return (
        <section className="model-readme">
            <SectionTitle>{t("readme.title")}</SectionTitle>

            <p className="model-readme__source">
                {t("readme.sourceNote")}
            </p>

            <div className="model-readme__content">
                {renderMarkdown(content, `https://huggingface.co/${modelId}/`)}
            </div>
        </section>
    );
}

export default ModelReadme;
