import "./ModelList.css";

import { ModelListProps } from "../../types";
import { formatCount, formatLanguages, formatParameters } from "../../utils/formatters";
import { getModelProvider, getModelSummary, getModelTagList } from "../../utils/modelCard";
import { DetailItem } from "@/ui";

import ModelImage from "./ModelImage";

// Ikony v kartě (SVG cesty pro viewBox 24×24)
const DOWNLOAD_ICON = "M12 3v12M7 10l5 5 5-5M5 21h14";
const LIKE_ICON = "M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8L12 21.2l8.8-8.8a5.5 5.5 0 0 0 0-7.8z";

/** Ikona karty ze SVG cesty, barvu dědí z okolního textu. */
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

                const tags = getModelTagList(model);
                const summary = getModelSummary(model);
                const provider = getModelProvider(model.author);

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
                                avatarUrl={model.avatarUrl}
                            />

                            <div className="model-list__identity">
                                <p className="model-list__name" title={model.name}>
                                    {model.name}
                                </p>

                                <p className="model-list__provider" title={model.author}>
                                    {provider}
                                </p>
                            </div>
                        </div>

                        <div className="model-list__body">
                            <p className="model-list__summary" title={summary}>
                                {summary}
                            </p>

                            <ul className="model-list__tags">
                                {tags.primary && (
                                    <li className="model-list__tag model-list__tag--primary">
                                        {tags.primary}
                                    </li>
                                )}

                                {tags.secondary.map((tag) => (
                                    <li className="model-list__tag" key={tag}>
                                        {tag}
                                    </li>
                                ))}

                                {tags.language && (
                                    <li className="model-list__tag">
                                        {tags.language}
                                    </li>
                                )}

                                {tags.remaining > 0 && (
                                    <li className="model-list__tag" title="Další štítky modelu">
                                        +{tags.remaining}
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
