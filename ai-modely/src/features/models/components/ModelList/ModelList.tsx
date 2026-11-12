import "./ModelList.css";

import { useTranslation } from "react-i18next";

import { translate } from "@/i18n/translate";

import { ModelListProps } from "../../types";
import { formatCount, formatDate, formatLanguages, formatParameters } from "../../utils/formatters";
import { getModelCardPreview, getModelLicense, getModelProvider, getModelSummary, getModelTagList } from "../../utils/modelCard";
import { ChipList, DetailItem, DOWNLOAD_ICON, LIKE_ICON, Stat } from "@/ui";

import ModelImage from "./ModelImage";

// Kolik řádků má kostra popisku (odpovídá pěti řádkům, na které se popis ořezává)
const SUMMARY_PLACEHOLDER_LINES = 5;

/** Kostra popisku, který se teprve generuje (drží stejný prostor jako hotový text) */
function SummaryPlaceholder() {
    return (
        <p className="model-list__summary model-list__summary--placeholder" aria-hidden="true">
            {Array.from({ length: SUMMARY_PLACEHOLDER_LINES }, (_, index) => (
                <span className="model-list__summary-line" key={index} />
            ))}
        </p>
    );
}

/** Zobrazuje seznam modelů */
function ModelList({ models, onModelClick, pendingDescriptionIds = [] }: ModelListProps) {

    const { t } = useTranslation("models");

    return (
        <ul className="model-list">
            {models.map((model) => {

                const tags = getModelTagList(model);
                const summary = getModelSummary(model);

                // Na kartě se ukazuje jen úryvek popisu zakončený výpustkou, celý text je v detailu
                const preview = getModelCardPreview(model);
                const provider = getModelProvider(model.author);

                // Popisek se teprve doplňuje: místo zástupného textu se ukáže kostra,
                // aby se karta po dopsání popisku nemusela zvětšovat
                const isSummaryPending = pendingDescriptionIds.includes(model.modelId);

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
                            {isSummaryPending ? (
                                <SummaryPlaceholder />
                            ) : (
                                <p className="model-list__summary">
                                    {preview}
                                </p>
                            )}

                            {chipTags.length > 0 && (
                                <ChipList
                                    items={chipTags}
                                    remaining={tags.remaining}
                                    remainingTitle={t("modelList.moreTags")}
                                    variant="muted"
                                />
                            )}

                            <div className="model-list__meta">
                                <DetailItem
                                    label={t("modelList.task")}
                                    value={tags.primary ?? translate("common:missingValue")}
                                    missing={!tags.primary}
                                />
                                <DetailItem label={t("modelList.parameters")} value={formatParameters(model.parameters)} missing={model.parameters === null} />
                                <DetailItem
                                    label={t("modelList.library")}
                                    value={model.library ?? translate("common:missingValue")}
                                    missing={!model.library}
                                />
                                <DetailItem label={t("modelList.license")} value={getModelLicense(model.license)} missing={!model.license} />
                                <DetailItem label={t("modelList.languages")} value={formatLanguages(model.languages)} missing={(model.languages?.length ?? 0) === 0} />
                                <DetailItem label={t("modelList.updated")} value={formatDate(model.lastModified)} missing={!model.lastModified} />
                            </div>

                            <div className="model-list__stats">
                                <Stat
                                    size="sm"
                                    icon={DOWNLOAD_ICON}
                                    value={formatCount(model.downloads)}
                                    label={t("modelList.downloads")}
                                />

                                <Stat
                                    size="sm"
                                    icon={LIKE_ICON}
                                    value={formatCount(model.likes)}
                                    label={t("modelList.likes")}
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
