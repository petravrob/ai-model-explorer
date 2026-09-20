import "./ModelList.css";

import { ModelListProps } from "../../types";
import { formatCount, formatLanguages, formatParameters } from "../../utils/formatters";
import { getModelBadge, getModelSummary, getModelTagList } from "../../utils/modelCard";
import { DetailItem } from "@/ui";

import ModelImage from "./ModelImage";

// Ikony u údajů v kartě (SVG cesty, viewBox 24×24)
const DOWNLOAD_ICON = "M12 3v12M7 10l5 5 5-5M5 21h14";
const LIKE_ICON = "M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8L12 21.2l8.8-8.8a5.5 5.5 0 0 0 0-7.8z";
const LINK_ICON = "M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3";

/** Vykreslí ikonu karty ze SVG cesty (viewBox 24×24), barva se dědí z textu. */
function CardIcon({ path }: { path: string }) {
    return (
        <svg
            className="model-list__icon"
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

/** Zobrazuje seznam modelů */
function ModelList({ models, onModelClick }: ModelListProps) {
    return (
        <ul className="model-list">
            {models.map((model) => {

                const badge = getModelBadge(model);
                const tagList = getModelTagList(model);

                return (
                    <li
                        className="model-list__item"
                        key={model._id ?? model.modelId}
                        onClick={() => onModelClick(model)}
                    >
                        <div className="model-list__media">
                            <ModelImage
                                name={model.name}
                                task={model.task}
                                author={model.author}
                            />

                            <p className="model-list__brand" title={model.author}>
                                {model.author}
                            </p>

                            <a
                                className="model-list__action"
                                href={model.url}
                                target="_blank"
                                rel="noreferrer"
                                title="Otevřít na Hugging Face"
                                aria-label={`Otevřít model ${model.name} na Hugging Face`}
                                onClick={(event) => event.stopPropagation()}
                            >
                                <CardIcon path={LINK_ICON} />
                            </a>
                        </div>

                        <div className="model-list__body">
                            <div className="model-list__headline">
                                <p className="model-list__name" title={model.name}>
                                    {model.name}
                                </p>

                                {badge && (
                                    <span className={`model-list__badge model-list__badge--${badge.variant}`}>
                                        {badge.label}
                                    </span>
                                )}
                            </div>

                            <p className="model-list__author">{model.author}</p>

                            <p className="model-list__summary">
                                {getModelSummary(model)}
                            </p>

                            <ul className="model-list__tags">
                                {tagList.primary && (
                                    <li className="model-list__tag model-list__tag--primary">
                                        {tagList.primary}
                                    </li>
                                )}

                                {tagList.secondary.map((tag) => (
                                    <li className="model-list__tag" key={tag}>
                                        {tag}
                                    </li>
                                ))}

                                {tagList.remaining > 0 && (
                                    <li className="model-list__tag" title="Další štítky modelu">
                                        {`+${tagList.remaining}`}
                                    </li>
                                )}
                            </ul>

                            <div className="model-list__meta">
                                <DetailItem label="Licence" value={model.license ?? "—"} />
                                <DetailItem label="Parametry" value={formatParameters(model.parameters)} />
                                <DetailItem label="Jazyky" value={formatLanguages(model.languages)} />
                            </div>

                            <div className="model-list__stats">
                                <span className="model-list__stat">
                                    <CardIcon path={DOWNLOAD_ICON} />
                                    <strong>{formatCount(model.downloads)}</strong> stažení
                                </span>

                                <span className="model-list__stat">
                                    <CardIcon path={LIKE_ICON} />
                                    <strong>{formatCount(model.likes)}</strong> oblíbení
                                </span>
                            </div>
                        </div>
                    </li>
                );
            })}
        </ul>
    );
}

export default ModelList;
