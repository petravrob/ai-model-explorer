import "./ModelReadme.css";

import { SectionTitle } from "@/ui";

/** Zobrazí text model card tak, jak ho má model na Hugging Face. */
function ModelReadme({ content }: { content: string }) {
    return (
        <section className="model-readme">
            <SectionTitle>Popis z Hugging Face</SectionTitle>

            <p className="model-readme__source">
                Text přebíráme z model card na Hugging Face, odkazy míří na původní zdroje.
            </p>

            <div className="model-readme__content">{content}</div>
        </section>
    );
}

export default ModelReadme;
