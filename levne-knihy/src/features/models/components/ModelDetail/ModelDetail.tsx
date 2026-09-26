import "./ModelDetail.css";

import { AIModel } from "../../types";
import { formatCount, formatDate, formatLanguages, formatParameters } from "../../utils/formatters";
import { getModelLicense, getModelProvider, getModelSummary, getModelTagList } from "../../utils/modelCard";
import { DetailItem, LinkButton, MISSING_VALUE, PageTitle, SectionTitle } from "@/ui";

import ModelImage from "../ModelList/ModelImage";
import ModelReadme from "../ModelReadme/ModelReadme";

// Ikony v hlavičce detailu (SVG cesty pro viewBox 24×24)
const DOWNLOAD_ICON = "M12 3v12M7 10l5 5 5-5M5 21h14";
const LIKE_ICON = "M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8L12 21.2l8.8-8.8a5.5 5.5 0 0 0 0-7.8z";

/** Ikona detailu ze SVG cesty, barvu dědí z okolního textu. */
function DetailIcon({ path }: { path: string }) {
    return (
        <svg
            className="model-detail__icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            <path d={path} />
        </svg>
    );
}

/** Zobrazuje detail modelu - hlavička s logem, popisek, údaje, štítky a text z Hugging Face. */
function ModelDetail({ model, cardContent, isCardLoading }: {
    model: AIModel;
    // Text model card dorazí až po modelu (načítá se zvlášť)
    cardContent: string | null;
    isCardLoading: boolean;
}) {
    const tags = getModelTagList(model);

    // Štítky z Hugging Face bez technických hodnot (např. "region:us")
    const rawTags = [...new Set((model.tags ?? []).filter((tag) => !tag.includes(":")))];

    return (
        <article className="model-detail">
            <header className="model-detail__hero">
                <ModelImage
                    className="model-detail__image"
                    name={model.name}
                    task={model.task}
                    author={model.author}
                    avatarUrl={model.avatarUrl}
                />

                <div className="model-detail__identity">
                    <PageTitle>{model.name}</PageTitle>

                    <p className="model-detail__provider">
                        {getModelProvider(model.author)}
                        {tags.primary ? ` · ${tags.primary}` : ""}
                    </p>

                    {tags.secondary.length > 0 && (
                        <ul className="model-detail__chips">
                            {tags.secondary.map((tag) => (
                                <li className="model-detail__chip" key={tag}>
                                    {tag}
                                </li>
                            ))}
                        </ul>
                    )}

                    <div className="model-detail__stats">
                        <span className="model-detail__stat">
                            <DetailIcon path={DOWNLOAD_ICON} />
                            <strong>{formatCount(model.downloads)}</strong> stažení
                        </span>

                        <span className="model-detail__stat">
                            <DetailIcon path={LIKE_ICON} />
                            <strong>{formatCount(model.likes)}</strong> oblíbení
                        </span>
                    </div>
                </div>
            </header>

            <p className="model-detail__summary">{getModelSummary(model)}</p>

            <section className="model-detail__section">
                <SectionTitle>Údaje o modelu</SectionTitle>

                <div className="model-detail__details">
                    <DetailItem label="Úloha" value={tags.primary ?? MISSING_VALUE} />
                    <DetailItem label="Parametry" value={formatParameters(model.parameters)} />
                    <DetailItem label="Knihovna" value={model.library ?? MISSING_VALUE} />
                    <DetailItem label="Licence" value={getModelLicense(model.license)} />
                    <DetailItem label="Jazyky" value={formatLanguages(model.languages, 12)} />
                    <DetailItem label="Aktualizace" value={formatDate(model.lastModified)} />
                </div>
            </section>

            {rawTags.length > 0 && (
                <section className="model-detail__section">
                    <SectionTitle>Štítky z Hugging Face</SectionTitle>

                    <ul className="model-detail__tags">
                        {rawTags.map((tag) => (
                            <li key={tag}>{tag}</li>
                        ))}
                    </ul>
                </section>
            )}

            {cardContent
                ? <ModelReadme content={cardContent} />
                : isCardLoading && <p className="model-detail__card-note">Načítám text model card…</p>}

            <LinkButton
                href={model.url}
                variant="outline"
                className="model-detail__link"
            >
                Zobrazit na Hugging Face
            </LinkButton>
        </article>
    );
}

export default ModelDetail;
