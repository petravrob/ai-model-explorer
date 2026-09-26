import "./ModelDetail.css";

import { AIModel } from "../../types";
import { formatCount, formatDate, formatLanguages, formatParameters } from "../../utils/formatters";
import { getModelLicense, getModelProvider, getModelTagList } from "../../utils/modelCard";
import { DetailItem, LinkButton, PageTitle, SectionTitle } from "@/ui";

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

/** Zobrazuje detail modelu - přehled, oblasti použití, technické údaje a původní dokumentaci. */
function ModelDetail({ model, cardContent, isCardLoading }: {
    model: AIModel;
    // Text model card dorazí až po modelu (načítá se zvlášť)
    cardContent: string | null;
    isCardLoading: boolean;
}) {
    const tags = getModelTagList(model);

    // Popisek se zobrazí, jen když ho model opravdu má (nic se nedomýšlí)
    const summary = model.description?.trim();

    // Oblasti použití vycházejí z úlohy a štítků modelu; když konkrétnější štítek chybí, ukáže se úloha
    const bestFor = tags.secondary.length > 0
        ? tags.secondary
        : (tags.primary ? [tags.primary] : []);

    // Technické údaje se vypíšou jen tehdy, když je model skutečně má
    const technical = [
        { label: "Parametry", value: model.parameters === null ? null : formatParameters(model.parameters) },
        { label: "Knihovna", value: model.library },
        { label: "Licence", value: model.license ? getModelLicense(model.license) : null },
        { label: "Jazyky", value: model.languages?.length ? formatLanguages(model.languages, 12) : null },
        { label: "Aktualizace", value: model.lastModified ? formatDate(model.lastModified) : null },
    ].filter((item): item is { label: string; value: string } => Boolean(item.value));

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

                    <p className="model-detail__provider">{getModelProvider(model.author)}</p>

                    {summary && <p className="model-detail__summary">{summary}</p>}

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

            {bestFor.length > 0 && (
                <section className="model-detail__section">
                    <SectionTitle>Nejvhodnější pro</SectionTitle>

                    <ul className="model-detail__chips">
                        {bestFor.map((item) => (
                            <li className="model-detail__chip" key={item}>
                                {item}
                            </li>
                        ))}
                    </ul>

                    <p className="model-detail__note">
                        Vychází z úlohy a štítků modelu na Hugging Face.
                    </p>
                </section>
            )}

            {technical.length > 0 && (
                <section className="model-detail__section">
                    <SectionTitle>Technické informace</SectionTitle>

                    <div className="model-detail__details">
                        {technical.map((item) => (
                            <DetailItem label={item.label} value={item.value} key={item.label} />
                        ))}
                    </div>
                </section>
            )}

            {cardContent
                ? <ModelReadme modelId={model.modelId} content={cardContent} />
                : isCardLoading && <p className="model-detail__card-note">Načítám text model card…</p>}

            <LinkButton
                href={model.url}
                variant="outline"
                className="model-detail__link"
            >
                Zobrazit původní dokumentaci na Hugging Face
            </LinkButton>
        </article>
    );
}

export default ModelDetail;
