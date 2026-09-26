import "./ModelDetail.css";

import { AIModel } from "../../types";
import { formatCount, formatDate, formatParameters } from "../../utils/formatters";
import { DetailItem, LinkButton, MISSING_VALUE, PageTitle, SectionTitle } from "@/ui";

/** Zobrazuje detailní informace o modelu. */
function ModelDetail({ model }: { model: AIModel }) {
    return (
        <article className="model-detail">
            <header>
                <PageTitle>{model.name}</PageTitle>
                <p className="author">{model.author}</p>
            </header>

            <div className="model-detail__details">
                <DetailItem label="Úloha" value={model.task} />
                <DetailItem label="Parametrů" value={formatParameters(model.parameters)} />
                <DetailItem label="Stažení" value={formatCount(model.downloads)} />
                <DetailItem label="Oblíbení" value={formatCount(model.likes)} />
                <DetailItem label="Licence" value={model.license ?? MISSING_VALUE} />
                <DetailItem label="Knihovna" value={model.library ?? MISSING_VALUE} />
                <DetailItem label="Naposledy aktualizováno" value={formatDate(model.lastModified)} />
            </div>

            <section>
                <SectionTitle>Štítky</SectionTitle>
                <ul className="model-detail__tags">
                    {(model.tags ?? []).map((tag) => (
                        <li key={tag}>{tag}</li>
                    ))}
                </ul>
            </section>

            <LinkButton
                href={model.url}
                className="model-detail__link"
            >
                Zobrazit na Hugging Face
            </LinkButton>
        </article>
    );
}

export default ModelDetail;
