import "./ModelList.css";

import { ModelListProps } from "../../types";
import { formatCount, formatDate, formatLanguages, formatParameters } from "../../utils/formatters";
import { getModelLicense, getModelProvider, getModelSummary, getModelTagList } from "../../utils/modelCard";
import { ChipList, DetailItem, DOWNLOAD_ICON, LIKE_ICON, MISSING_VALUE, Stat } from "@/ui";

import ModelImage from "./ModelImage";

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
                                <ChipList
                                    items={chipTags}
                                    remaining={tags.remaining}
                                    remainingTitle="Další štítky modelu"
                                    variant="muted"
                                />
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
                                <Stat
                                    size="sm"
                                    icon={DOWNLOAD_ICON}
                                    value={formatCount(model.downloads)}
                                    label="stažení"
                                />

                                <Stat
                                    size="sm"
                                    icon={LIKE_ICON}
                                    value={formatCount(model.likes)}
                                    label="oblíbení"
                                />
                            </div>
                        </div>
                    </li>
                );
            })}
        </ul>
    );
}

export default ModelList;
