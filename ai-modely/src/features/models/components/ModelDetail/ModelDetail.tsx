import "./ModelDetail.css";

import { useTranslation } from "react-i18next";

import { AIModel, ModelInsights } from "../../types";
import { formatCount, formatDate, formatLanguages, formatParameters } from "../../utils/formatters";
import { getModelLicense, getModelProvider, getModelSummary, getModelTagList, isModelItself } from "../../utils/modelCard";
import { getModelHighlights } from "../../utils/modelHighlights";
import { getModelLimitations } from "../../utils/modelLimitations";
import { getDeploymentDescription } from "../../utils/deploymentLabels";
import {
    BulletList,
    ChipList,
    DocumentImage,
    DocumentVideo,
    DOWNLOAD_ICON,
    FieldGroup,
    FlowDiagram,
    LIKE_ICON,
    ModalityBadges,
    PageTitle,
    Section,
    Stat,
} from "@/ui";

import ModelFacts, { type ModelFactItem } from "./ModelFacts";
import ModelImage from "../ModelList/ModelImage";

// Kolik oblastí použití se nejvýš vypíše (delší výčet už se nedá prohlédnout)
const MAX_BEST_FOR = 8;

// Kolik štítků se vejde do hlavičky
const MAX_HEADER_TAGS = 5;

/** Odfiltruje prázdné položky - sekce bez hodnot se pak vůbec nezobrazí. */
const nonEmpty = (items: string[] | undefined): string[] =>
    (items ?? []).map((item) => item.trim()).filter(Boolean);

/**
 * Detail modelu - souhrn toho, co model umí, na co se hodí, jak se nasazuje
 * a na co si dát pozor.
 *
 * Stránka je záměrně souhrn (není chtěné pouze vytvořit překlad README z Hugging Face).
 * Hlavní sloupec popisuje model, boční panel shrnuje technické údaje a nasazení.
 */
function ModelDetail({ model, insights }: {
    model: AIModel;
    // Přehledy z dokumentace (mohou dorazit později, nebo vůbec)
    insights: ModelInsights | null;
}) {
    const { t } = useTranslation("models");

    const tags = getModelTagList(model);

    // Souvislý popis modelu v hlavičce: přednost má český text, jinak popisek modelu
    const description = (model.description?.trim() || getModelSummary(model))
        .split(/\n{2,}/)
        .map((paragraph) => paragraph.trim())
        .filter(Boolean);

    // Oblasti použití: přednost má dokumentace, jinak se použijí štítky modelu
    const documentedAreas = [...new Set([
        ...(insights?.bestFor ?? []),
        ...(insights?.useCases ?? []),
        ...(insights?.capabilities ?? []),
    ].map((item) => item.trim()).filter(Boolean))];

    const bestFor = (documentedAreas.length > 0
        ? documentedAreas
        : (tags.secondary.length > 0 ? tags.secondary : (tags.primary ? [tags.primary] : []))
    ).slice(0, MAX_BEST_FOR);

    // Vlastnosti, které model odlišují: přednost má výčet z dokumentace,
    // jinak se odvodí z doložených údajů (nesmí se opakovat s ostatními sekcemi)
    const documentedHighlights = nonEmpty(insights?.highlights);
    const highlights = documentedHighlights.length > 0
        ? documentedHighlights
        : getModelHighlights(model, insights);

    // Omezení: přednost má dokumentace, jinak se odvodí z doložených údajů modelu
    const documentedLimitations = nonEmpty(insights?.limitations);
    const limitations = documentedLimitations.length > 0
        ? documentedLimitations
        : getModelLimitations(model, insights);
    const deployment = nonEmpty(insights?.inferenceFrameworks);
    const settings = nonEmpty(insights?.recommendedSettings);
    const hardware = nonEmpty(insights?.hardwareRequirements);
    const quantization = nonEmpty(insights?.quantization);
    const compatibility = nonEmpty(insights?.compatibility);

    // Varianta se stejným názvem, jako má model sám, se neuvádí
    const variants = nonEmpty(insights?.variants).filter((variant) => !isModelItself(model, variant));

    // U modelů typu MoE se rozlišují celkové a aktivní parametry
    const totalParameters = model.parameters === null ? null : formatParameters(model.parameters);
    const parameterNote = totalParameters && insights?.activeParameters
        ? t("modelDetail.activeParametersNote", { value: insights.activeParameters })
        : undefined;

    // Druhy vstupů a výstupů modelu jako odznaky s ikonou
    const modalityBadges = insights?.modalities ?? [];

    // Schéma toku dat (vstup → zpracování → výstup) se kreslí jen tehdy,
    // když dokumentace způsob zpracování uvádí
    const flowSteps = insights?.architecture
        ? [
            insights.modalities?.length
                ? t("modelDetail.flowInput", { value: insights.modalities.join(", ") })
                : null,
            insights.architecture,
            tags.primary ? t("modelDetail.flowOutput", { value: tags.primary }) : null,
        ].filter((step): step is string => Boolean(step))
        : [];

    // Technické údaje na začátku bočního panelu – jen ty, které model skutečně má.
    // U každé položky je krátké vysvětlení, co údaj znamená pro běžného uživatele
    const technical = [
        {
            label: t("modelDetail.facts.task.label"),
            value: tags.primary ?? null,
            description: t("modelDetail.facts.task.description"),
        },
        {
            label: t("modelDetail.facts.input.label"),
            value: modalityBadges.length > 0 ? modalityBadges.join(", ") : null,
            description: t("modelDetail.facts.input.description"),
        },
        {
            label: t("modelDetail.facts.parameters.label"),
            value: totalParameters ?? (
                insights?.activeParameters
                    ? t("modelDetail.activeParametersOnly", { value: insights.activeParameters })
                    : null
            ),
            note: parameterNote,
            description: t("modelDetail.facts.parameters.description"),
        },
        {
            label: t("modelDetail.facts.architecture.label"),
            value: insights?.architecture ?? null,
            description: t("modelDetail.facts.architecture.description"),
        },
        {
            label: t("modelDetail.facts.context.label"),
            value: insights?.contextLength ?? null,
            description: t("modelDetail.facts.context.description"),
        },
        {
            label: t("modelDetail.facts.version.label"),
            value: insights?.version ?? null,
            description: t("modelDetail.facts.version.description"),
        },
        {
            label: t("modelDetail.facts.library.label"),
            value: model.library,
            description: t("modelDetail.facts.library.description"),
        },
        {
            label: t("modelDetail.facts.license.label"),
            value: model.license ? getModelLicense(model.license) : null,
            description: t("modelDetail.facts.license.description"),
        },
        {
            label: t("modelDetail.facts.languages.label"),
            value: model.languages?.length ? formatLanguages(model.languages, 12) : null,
            description: t("modelDetail.facts.languages.description"),
        },
        {
            label: t("modelDetail.facts.updated.label"),
            value: model.lastModified ? formatDate(model.lastModified) : null,
            description: t("modelDetail.facts.updated.description"),
        },
    ].filter((item): item is ModelFactItem => Boolean(item.value));

    // Obrázky, videa a tabulky se berou přímo z dokumentace modelu
    const images = insights?.images ?? [];
    const videos = insights?.videos ?? [];

    // Původ a varianty modelu: jen vztahy, které dokumentace nebo data skutečně uvádějí;
    // varianty se vypíšou přímo jako součást posledního kroku (oddělené čárkou)
    const familySteps = [
        insights?.baseModel ? t("modelDetail.familyBasedOn", { value: insights.baseModel }) : null,
        model.name,
        variants.length > 0
            ? t("modelDetail.familyVariants", { value: variants.join(", ") })
            : null,
    ].filter((step): step is string => Boolean(step));

    // Boční panel se vykreslí jen tehdy, když je co ukázat
    const showTechnical = technical.length > 0;
    const showFlow = flowSteps.length > 1;
    const showBestFor = bestFor.length > 0;
    const showFamily = familySteps.length > 1;
    const showDeployment = deployment.length > 0 || settings.length > 0;
    const showHardware = hardware.length > 0;
    const showQuantization = quantization.length > 0;
    const showCompatibility = compatibility.length > 0;
    const hasSidebar =
        showTechnical ||
        showFlow ||
        showFamily ||
        showHardware ||
        showDeployment ||
        showQuantization ||
        showCompatibility;

    // Štítky v hlavičce: hlavní úloha a doplňkové štítky modelu
    const headerTags = [tags.primary, ...tags.secondary]
        .filter(Boolean)
        .slice(0, MAX_HEADER_TAGS) as string[];

    // Druhy vstupůy výstupů a štítky modelu
    // (sloučení přes Set zabrání duplicitním klíčům)
    const headerBadges = [...new Set([...modalityBadges, ...headerTags])];

    return (
        <article className="model-detail">
            <div className="model-detail__main">
                <header className="model-detail__hero">
                    <div className="model-detail__hero-side">
                        <ModelImage
                            className="model-detail__image"
                            name={model.name}
                            author={model.author}
                            avatarUrl={model.avatarUrl}
                        />
                    </div>

                    <div className="model-detail__identity">
                        <PageTitle>{model.name}</PageTitle>

                        <div className="model-detail__meta">
                            <p className="model-detail__provider">{getModelProvider(model.author)}</p>

                            <div className="model-detail__stats">
                                <Stat
                                    icon={DOWNLOAD_ICON}
                                    value={formatCount(model.downloads)}
                                    label={t("modelDetail.downloads")}
                                />

                                <Stat
                                    icon={LIKE_ICON}
                                    value={formatCount(model.likes)}
                                    label={t("modelDetail.likes")}
                                />
                            </div>
                        </div>

                        {headerBadges.length > 0 && (
                            <div className="model-detail__tags">
                                <ModalityBadges items={headerBadges} />
                            </div>
                        )}
                    </div>

                    <a className="model-detail__hero-link" href={model.url} target="_blank" rel="noreferrer">
                        Hugging Face ↗
                    </a>

                    {showBestFor && (
                        <Section title={t("modelDetail.sections.bestFor")} className="model-detail__best-for">
                            <ChipList items={bestFor} />

                        </Section>
                    )}

                    {description.length > 0 && (
                        <div className="model-detail__about">
                            {description.map((paragraph) => (
                                <p key={paragraph}>{paragraph}</p>
                            ))}
                        </div>
                    )}
                </header>

                {(highlights.length > 0 || limitations.length > 0) && (
                    <div className="model-detail__split">
                        {highlights.length > 0 && (
                            <Section title={t("modelDetail.sections.whyThisModel")}>
                                <BulletList variant="check" items={highlights} />
                            </Section>
                        )}

                        {limitations.length > 0 && (
                            <Section title={t("modelDetail.sections.limitations")}>
                                <BulletList items={limitations} />
                            </Section>
                        )}
                    </div>
                )}

                {(videos.length > 0 || images.length > 0) && (
                    <Section title={t("modelDetail.sections.gallery")} className="model-detail__gallery">
                        {videos.length > 0 && (
                            <div className="model-detail__images">
                                {videos.map((video) => (
                                    <DocumentVideo
                                        url={video.url}
                                        title={video.title}
                                        thumbnail={video.thumbnail}
                                        key={video.url}
                                    />
                                ))}
                            </div>
                        )}

                        {images.length > 0 && (
                            <div className="model-detail__images">
                                {images.map((image) => (
                                    <DocumentImage
                                        src={image.url}
                                        alt={image.alt}
                                        caption={image.caption}
                                        key={image.url}
                                    />
                                ))}
                            </div>
                        )}

                    </Section>
                )}

            </div>

            {hasSidebar && (
                <aside className="model-detail__sidebar">
                    {showFlow && (
                        <Section title={t("modelDetail.sections.howItWorks")}>
                            <FlowDiagram
                                steps={flowSteps}
                                description={t("modelDetail.flowDescription")}
                            />
                        </Section>
                    )}

                    {showTechnical && <ModelFacts items={technical} />}

                    {showFamily && (
                        <Section title={t("modelDetail.sections.family")}>
                            <FlowDiagram
                                steps={familySteps}
                                description={t("modelDetail.familyDescription")}
                            />
                        </Section>
                    )}

                    {showHardware && (
                        <Section title={t("modelDetail.sections.hardware")}>
                            <BulletList items={hardware} />
                        </Section>
                    )}

                    {showDeployment && (
                        <Section title={t("modelDetail.sections.deployment")}>
                            {deployment.length > 0 && (
                                <ChipList
                                    items={deployment}
                                    itemTitles={Object.fromEntries(
                                        deployment.map((name) => [name, getDeploymentDescription(name)])
                                    )}
                                />
                            )}

                            {settings.length > 0 && (
                                <FieldGroup label={t("modelDetail.recommendedSettings")}>
                                    <BulletList items={settings} />
                                </FieldGroup>
                            )}
                        </Section>
                    )}

                    {showCompatibility && (
                        <Section title={t("modelDetail.sections.compatibility")}>
                            <BulletList items={compatibility} />
                        </Section>
                    )}

                    {showQuantization && (
                        <Section title={t("modelDetail.sections.quantization")}>
                            <BulletList items={quantization} />
                        </Section>
                    )}
                </aside>
            )}
        </article>
    );
}

export default ModelDetail;
