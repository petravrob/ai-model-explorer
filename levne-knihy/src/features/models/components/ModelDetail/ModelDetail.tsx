import "./ModelDetail.css";

import { AIModel, ModelBenchmark, ModelInsights } from "../../types";
import { formatCount, formatDate, formatLanguages, formatParameters } from "../../utils/formatters";
import { getModelLicense, getModelProvider, getModelSummary, getModelTagList, isModelItself } from "../../utils/modelCard";
import { getModelHighlights } from "../../utils/modelHighlights";
import { getBenchmarkPercent } from "../../utils/benchmarkScores";
import { getBenchmarkCategoryLabel, getBenchmarkNameLabel } from "../../utils/benchmarkLabels";
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
    ScoreBar,
    Section,
    SectionTitle,
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

/** Benchmarky seskupené podle oblasti, pokud ji dokumentace uvádí. */
interface BenchmarkGroup {
    category: string | null;
    items: ModelBenchmark[];
}

/** Seskupí benchmarky podle oblasti, pokud ji dokumentace uvádí. */
const groupBenchmarks = (benchmarks: ModelBenchmark[]): BenchmarkGroup[] =>
    benchmarks.reduce<BenchmarkGroup[]>(
        (groups, benchmark) => {
            const category = benchmark.category ?? null;
            const group = groups.find((item) => item.category === category);

            if (group) {
                group.items.push(benchmark);
            } else {
                groups.push({ category, items: [benchmark] });
            }

            return groups;
        },
        []
    );

/** Skupiny benchmarků z dokumentace: nadpis oblasti a řádky s výsledky. */
function BenchmarkGroups({ groups }: { groups: BenchmarkGroup[] }) {
    return (
        <div className="model-detail__benchmarks">
            {groups.map((group) => (
                <div className="model-detail__benchmark-group" key={group.category ?? "bez kategorie"}>
                    {group.category && <SectionTitle>{getBenchmarkCategoryLabel(group.category)}</SectionTitle>}

                    {group.items.map((benchmark) => {
                        const percent = getBenchmarkPercent(benchmark);

                        return (
                            <p className="model-detail__benchmark" key={`${benchmark.name}-${benchmark.score}`}>
                                <span className="model-detail__benchmark-name">{getBenchmarkNameLabel(benchmark.name)}</span>
                                <strong className="model-detail__benchmark-score">{benchmark.score}</strong>

                                {percent !== null && (
                                    <ScoreBar percent={percent} className="model-detail__benchmark-bar" />
                                )}

                                {benchmark.context && (
                                    <span className="model-detail__benchmark-meta">
                                        {benchmark.context}
                                    </span>
                                )}
                            </p>
                        );
                    })}
                </div>
            ))}
        </div>
    );
}

/**
 * Detail modelu - souhrn toho, co model umí, na co se hodí, jak se nasazuje
 * a na co si dát pozor.
 *
 * Stránka je záměrně souhrn (není chtěné pouze vytvořit překlad README z Hugging Face).
 * Hlavní sloupec popisuje model, boční panel shrnuje nasazení a výsledky měření.
 */
function ModelDetail({ model, insights }: {
    model: AIModel;
    // Přehledy z dokumentace (mohou dorazit později, nebo vůbec)
    insights: ModelInsights | null;
}) {
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

    const limitations = nonEmpty(insights?.limitations);
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
        ? `aktivně ${insights.activeParameters}`
        : undefined;

    // Druhy vstupů a výstupů modelu jako odznaky s ikonou
    const modalityBadges = insights?.modalities ?? [];

    // Schéma toku dat (vstup → zpracování → výstup) se kreslí jen tehdy,
    // když dokumentace způsob zpracování uvádí
    const flowSteps = insights?.architecture
        ? [
            insights.modalities?.length ? `Vstup: ${insights.modalities.join(", ")}` : null,
            insights.architecture,
            tags.primary ? `Výstup: ${tags.primary}` : null,
        ].filter((step): step is string => Boolean(step))
        : [];

    // Technické údaje na začátku bočního panelu – jen ty, které model skutečně má.
    // U každé položky je krátké vysvětlení, co údaj znamená pro běžného uživatele
    const technical = [
        {
            label: "Úloha",
            value: tags.primary ?? null,
            description: "Co model umí, tedy jaký výsledek vrací uživateli.",
        },
        {
            label: "Vstup",
            value: modalityBadges.length > 0 ? modalityBadges.join(", ") : null,
            description: "Co všechno dokáže model zpracovat.",
        },
        {
            label: "Parametry",
            value: totalParameters ?? (insights?.activeParameters ? `${insights.activeParameters} aktivně` : null),
            note: parameterNote,
            description: "Jak je model velký. Větší modely obvykle umí víc, ale jsou náročnější na provoz.",
        },
        {
            label: "Architektura / zpracování",
            value: insights?.architecture ?? null,
            description: "Z čeho se model skládá a jakým způsobem zpracovává data.",
        },
        {
            label: "Kontext",
            value: insights?.contextLength ?? null,
            description: "Kolik textu si model najednou dokáže přečíst a vzít v úvahu.",
        },
        {
            label: "Verze",
            value: insights?.version ?? null,
            description: "Označení vydání modelu pro rozlišení novější a starší podoby.",
        },
        {
            label: "Knihovna",
            value: model.library,
            description: "Programová knihovna, ve které se model nejčastěji spouští.",
        },
        {
            label: "Licence",
            value: model.license ? getModelLicense(model.license) : null,
            description: "Za jakých podmínek můžete model používat.",
        },
        {
            label: "Jazyky",
            value: model.languages?.length ? formatLanguages(model.languages, 12) : null,
            description: "Jazyky, kterým model rozumí.",
        },
        {
            label: "Aktualizace",
            value: model.lastModified ? formatDate(model.lastModified) : null,
            description: "Kdy byl model naposledy upraven.",
        },
    ].filter((item): item is ModelFactItem => Boolean(item.value));

    // Obrázky, videa a tabulky se berou přímo z dokumentace modelu
    const images = insights?.images ?? [];
    const videos = insights?.videos ?? [];

    // Původ a varianty modelu: jen vztahy, které dokumentace nebo data skutečně uvádějí;
    // varianty se vypíšou přímo jako součást posledního kroku (oddělené čárkou)
    const familySteps = [
        insights?.baseModel ? `Vychází z: ${insights.baseModel}` : null,
        model.name,
        variants.length > 0 ? `Varianty: ${variants.join(", ")}` : null,
    ].filter((step): step is string => Boolean(step));

    // Benchmarky se rozdělí: výsledky v procentech s pruhy tvoří „Výkon“,
    // zbytek metrik bez procent jsou „Benchmarky“
    const benchmarks = insights?.benchmarks ?? [];
    const performanceBenchmarks = benchmarks.filter((benchmark) => getBenchmarkPercent(benchmark) !== null);
    const otherBenchmarks = benchmarks.filter((benchmark) => getBenchmarkPercent(benchmark) === null);

    // Boční panel se vykreslí jen tehdy, když je co ukázat
    const showTechnical = technical.length > 0;
    const showFlow = flowSteps.length > 1;
    const showBestFor = bestFor.length > 0;
    const showFamily = familySteps.length > 1;
    const showDeployment = deployment.length > 0 || settings.length > 0;
    const showPerformance = performanceBenchmarks.length > 0;
    const showOtherBenchmarks = otherBenchmarks.length > 0;
    const showHardware = hardware.length > 0;
    const showQuantization = quantization.length > 0;
    const hasSidebar =
        showTechnical ||
        showFlow ||
        showFamily ||
        showHardware ||
        showDeployment ||
        showPerformance ||
        showOtherBenchmarks ||
        showQuantization;

    // Štítky v hlavičce: hlavní úloha a doplňkové štítky modelu
    const headerTags = [tags.primary, ...tags.secondary]
        .filter(Boolean)
        .slice(0, MAX_HEADER_TAGS) as string[];

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
                                    label="stažení"
                                />

                                <Stat
                                    icon={LIKE_ICON}
                                    value={formatCount(model.likes)}
                                    label="oblíbení"
                                />
                            </div>
                        </div>

                        {(headerTags.length > 0 || modalityBadges.length > 0) && (
                            <div className="model-detail__tags">
                                {modalityBadges.length > 0 && <ModalityBadges items={modalityBadges} />}

                                {headerTags.length > 0 && <ChipList items={headerTags} />}
                            </div>
                        )}
                    </div>

                    <a className="model-detail__hero-link" href={model.url} target="_blank" rel="noreferrer">
                        Hugging Face ↗
                    </a>

                    {showBestFor && (
                        <Section title="Nejvhodnější pro" className="model-detail__best-for">
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
                            <Section title="Proč tento model?">
                                <BulletList variant="check" items={highlights} />
                            </Section>
                        )}

                        {limitations.length > 0 && (
                            <Section title="Omezení">
                                <BulletList items={limitations} />
                            </Section>
                        )}
                    </div>
                )}

                {(videos.length > 0 || images.length > 0) && (
                    <Section title="Obrázky z Hugging Face">
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

                {compatibility.length > 0 && (
                    <Section title="Kompatibilita">
                        <BulletList items={compatibility} />
                    </Section>
                )}
            </div>

            {hasSidebar && (
                <aside className="model-detail__sidebar">
                    {showFlow && (
                        <Section title="Jak model pracuje">
                            <FlowDiagram
                                steps={flowSteps}
                                description="Schéma znázorňuje cestu dat: co model dostane na vstup, jak je zpracuje a co vrátí."
                            />
                        </Section>
                    )}

                    {showTechnical && <ModelFacts items={technical} />}

                    {showPerformance && (
                        <div className="model-detail__benchmark-section">
                            <BenchmarkGroups groups={groupBenchmarks(performanceBenchmarks)} />
                        </div>
                    )}

                    {showOtherBenchmarks && (
                        <Section title="Benchmarky">
                            <BenchmarkGroups groups={groupBenchmarks(otherBenchmarks)} />
                        </Section>
                    )}

                    {showFamily && (
                        <Section title="Původ a varianty modelu">
                            <FlowDiagram
                                steps={familySteps}
                                description="Schéma znázorňuje původ modelu: ze kterého modelu vychází a jaké má odvozené varianty."
                            />
                        </Section>
                    )}

                    {showHardware && (
                        <Section title="Nároky na hardware">
                            <BulletList items={hardware} />
                        </Section>
                    )}

                    {showDeployment && (
                        <Section title="Nasazení a použití">
                            {deployment.length > 0 && (
                                <ChipList
                                    items={deployment}
                                    itemTitles={Object.fromEntries(
                                        deployment.map((name) => [name, getDeploymentDescription(name)])
                                    )}
                                />
                            )}

                            {settings.length > 0 && (
                                <FieldGroup label="Doporučené nastavení">
                                    <BulletList items={settings} />
                                </FieldGroup>
                            )}
                        </Section>
                    )}

                    {showQuantization && (
                        <Section title="Kvantizace a formáty">
                            <BulletList items={quantization} />
                        </Section>
                    )}
                </aside>
            )}
        </article>
    );
}

export default ModelDetail;
