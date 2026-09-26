import "./ModelList.css";

import { ModelListProps } from "../../types";
import { formatCount, formatDate, formatLanguages, formatParameters } from "../../utils/formatters";
import { getModelLicense, getModelProvider, getModelSummary, getModelTagList } from "../../utils/modelCard";
import { DetailItem, MISSING_VALUE } from "@/ui";

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

                // Když model nemá vlastní štítek, ukáže se aspoň jeho úloha
                const chipTags = tags.secondary.length > 0 ? tags.secondary : (tags.primary ? [tags.primary] : []);

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

                            {chipTags.length > 0 && (
                                <ul className="model-list__tags">
                                    {chipTags.map((tag) => (
                                        <li className="model-list__tag" key={tag}>
                                            {tag}
                                        </li>
                                    ))}

                                    {tags.remaining > 0 && (
                                        <li className="model-list__tag" title="Další štítky modelu">
                                            +{tags.remaining}
                                        </li>
                                    )}
                                </ul>
                            )}

                            <div className="model-list__meta">
                                <DetailItem label="Úloha" value={tags.primary ?? MISSING_VALUE} />
                                <DetailItem label="Parametry" value={formatParameters(model.parameters)} />
                                <DetailItem label="Knihovna" value={model.library ?? MISSING_VALUE} />
                                <DetailItem label="Licence" value={getModelLicense(model.license)} />
                                <DetailItem label="Jazyky" value={formatLanguages(model.languages)} />
                                <DetailItem label="Aktualizace" value={formatDate(model.lastModified)} />
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
