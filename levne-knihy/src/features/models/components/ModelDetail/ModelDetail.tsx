import "./ModelDetail.css";

import { AIModel, ModelBenchmark, ModelInsights } from "../../types";
import { formatCount, formatDate, formatLanguages, formatParameters } from "../../utils/formatters";
import { getModelLicense, getModelProvider, getModelSummary, getModelTagList, isModelItself } from "../../utils/modelCard";
import { getModelHighlights } from "../../utils/modelHighlights";
import { getBenchmarkPercent } from "../../utils/benchmarkScores";
import {
    BulletList,
    ChipList,
    DataTable,
    DocumentImage,
    DocumentVideo,
    DOWNLOAD_ICON,
    FieldGroup,
    FlowDiagram,
    LIKE_ICON,
    ModalityBadges,
    Note,
    PageTitle,
    ScoreBar,
    Section,
    SectionTitle,
    Stat,
    TileGrid,
} from "@/ui";
import type { MetricItem } from "@/ui";

import ModelImage from "../ModelList/ModelImage";

// Kolik oblastí použití se nejvýš vypíše (delší výčet už se nedá prohlédnout)
const MAX_BEST_FOR = 8;

// Kolik štítků se vejde do hlavičky
const MAX_HEADER_TAGS = 5;

// Metriky, které popisují latenci, rychlost nebo efektivitu provozu modelu
const EFFICIENCY_METRIC = /(latenc|rychl|efektiv|throughput|tokens?\s*\/\s*s|odezv)/i;

/** Rozpozná benchmark, který měří latenci, rychlost nebo efektivitu. */
const isEfficiencyBenchmark = (benchmark: ModelBenchmark): boolean =>
    EFFICIENCY_METRIC.test(
        [benchmark.name, benchmark.metric, benchmark.category, benchmark.context]
            .filter(Boolean)
            .join(" ")
    );

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
                    {group.category && <SectionTitle>{group.category}</SectionTitle>}

                    {group.items.map((benchmark) => {
                        const percent = getBenchmarkPercent(benchmark);

                        return (
                            <p className="model-detail__benchmark" key={`${benchmark.name}-${benchmark.score}`}>
                                <span className="model-detail__benchmark-name">{benchmark.name}</span>
                                <strong className="model-detail__benchmark-score">{benchmark.score}</strong>

                                {percent !== null && (
                                    <ScoreBar percent={percent} className="model-detail__benchmark-bar" />
                                )}

                                {(benchmark.metric || benchmark.context) && (
                                    <span className="model-detail__benchmark-meta">
                                        {[benchmark.metric, benchmark.context].filter(Boolean).join(" · ")}
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
    const highlights = insights?.highlights?.length
        ? insights.highlights
        : getModelHighlights(model, insights);

    const limitations = insights?.limitations ?? [];
    const deployment = insights?.inferenceFrameworks ?? [];
    const settings = insights?.recommendedSettings ?? [];
    const hardware = insights?.hardwareRequirements ?? [];
    const quantization = insights?.quantization ?? [];
    const compatibility = insights?.compatibility ?? [];
    const notes = insights?.notes ?? [];

    // Varianta se stejným názvem, jako má model sám, se neuvádí
    const variants = (insights?.variants ?? []).filter((variant) => !isModelItself(model, variant));

    // U modelů typu MoE se rozlišují celkové a aktivní parametry
    const totalParameters = model.parameters === null ? null : formatParameters(model.parameters);
    const parameterNote = totalParameters && insights?.activeParameters
        ? `aktivně ${insights.activeParameters}`
        : undefined;

    // Druhy vstupů a výstupů modelu jako odznaky s ikonou
    const modalityBadges = insights?.modalities ?? [];

    // Schéma zapojení se kreslí jen tehdy, když dokumentace architekturu uvádí
    const flowSteps = insights?.architecture
        ? [
            insights.modalities?.length ? `Vstup: ${insights.modalities.join(", ")}` : null,
            insights.architecture,
            tags.primary ? `Výstup: ${tags.primary}` : null,
        ].filter((step): step is string => Boolean(step))
        : [];

    // Technické údaje na začátku bočního panelu – jen ty, které model skutečně má
    const technical = [
        { label: "Úloha", value: tags.primary ?? null },
        {
            label: "Parametry",
            value: totalParameters ?? (insights?.activeParameters ? `${insights.activeParameters} aktivně` : null),
            note: parameterNote,
        },
        { label: "Architektura", value: insights?.architecture ?? null },
        { label: "Kontext", value: insights?.contextLength ?? null },
        { label: "Verze", value: insights?.version ?? null },
        { label: "Knihovna", value: model.library },
        { label: "Licence", value: model.license ? getModelLicense(model.license) : null },
        { label: "Jazyky", value: model.languages?.length ? formatLanguages(model.languages, 12) : null },
        { label: "Aktualizace", value: model.lastModified ? formatDate(model.lastModified) : null },
    ].filter((item): item is MetricItem => Boolean(item.value));

    // Skládanka nasazení: doložené nástroje pro inference
    const deploymentSteps = deployment.slice(0, 4);

    // Obrázky, videa a tabulky se berou přímo z dokumentace modelu
    const images = insights?.images ?? [];
    const videos = insights?.videos ?? [];
    const tables = insights?.tables ?? [];

    // Rodina modelu: jen vztahy, které dokumentace nebo data skutečně uvádějí
    const familySteps = [
        insights?.baseModel ? `Vychází z: ${insights.baseModel}` : null,
        model.name,
        variants.length > 0 ? `Varianty (${variants.length})` : null,
    ].filter((step): step is string => Boolean(step));

    // Benchmarky se rozdělí: výsledky v procentech s pruhy tvoří „Výkon“,
    // metriky latence a efektivity mají vlastní sekci a zbytek jsou „Benchmarky“
    const benchmarks = insights?.benchmarks ?? [];
    const performanceBenchmarks = benchmarks.filter((benchmark) => getBenchmarkPercent(benchmark) !== null);
    const efficiencyBenchmarks = benchmarks.filter(
        (benchmark) => getBenchmarkPercent(benchmark) === null && isEfficiencyBenchmark(benchmark)
    );
    const otherBenchmarks = benchmarks.filter(
        (benchmark) => getBenchmarkPercent(benchmark) === null && !isEfficiencyBenchmark(benchmark)
    );

    // Boční panel se vykreslí jen tehdy, když je co ukázat
    const showTechnical = technical.length > 0;
    const showDeployment = deployment.length > 0 || settings.length > 0;
    const showPerformance = performanceBenchmarks.length > 0;
    const showOtherBenchmarks = otherBenchmarks.length > 0;
    const showEfficiency = efficiencyBenchmarks.length > 0 || quantization.length > 0 || hardware.length > 0;
    const hasSidebar = showTechnical || showDeployment || showPerformance || showOtherBenchmarks || showEfficiency;

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

                        <p className="model-detail__provider">{getModelProvider(model.author)}</p>

                        {headerTags.length > 0 && <ChipList items={headerTags} />}

                        {modalityBadges.length > 0 && <ModalityBadges items={modalityBadges} />}

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

                    <a className="model-detail__hero-link" href={model.url} target="_blank" rel="noreferrer">
                        Hugging Face ↗
                    </a>

                    {description.length > 0 && (
                        <div className="model-detail__about">
                            {description.map((paragraph) => (
                                <p key={paragraph}>{paragraph}</p>
                            ))}

                            {flowSteps.length > 1 && <FlowDiagram steps={flowSteps} />}
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
                                <div className="model-detail__panel">
                                    <ul className="model-detail__limitations">
                                        {limitations.map((item) => (
                                            <li key={item}>{item}</li>
                                        ))}
                                    </ul>
                                </div>
                            </Section>
                        )}
                    </div>
                )}

                {bestFor.length > 0 && (
                    <Section title="Nejvhodnější pro">
                        <TileGrid items={bestFor} />

                        <Note>
                            {documentedAreas.length > 0
                                ? "Vychází z dokumentace modelu na Hugging Face."
                                : "Vychází z úlohy a štítků modelu na Hugging Face."}
                        </Note>
                    </Section>
                )}

                {(videos.length > 0 || images.length > 0) && (
                    <Section title="Vizuální ukázky">
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

                        <Note>Převzato z dokumentace modelu na Hugging Face.</Note>
                    </Section>
                )}

                {tables.length > 0 && (
                    <Section title="Přehled a výsledky">
                        {tables.map((table, index) => (
                            <FieldGroup
                                label={table.title || "Tabulka z dokumentace"}
                                key={`${table.title}-${index}`}
                            >
                                <DataTable headers={table.headers} rows={table.rows} />
                            </FieldGroup>
                        ))}

                        <Note>Převzato z dokumentace modelu na Hugging Face.</Note>
                    </Section>
                )}

                {(variants.length > 0 || insights?.baseModel || notes.length > 0) && (
                    <Section title="Důležité informace">
                        {familySteps.length > 1 && <FlowDiagram steps={familySteps} />}

                        {variants.length > 0 && (
                            <FieldGroup label="Varianty">
                                <ChipList items={variants} />
                            </FieldGroup>
                        )}

                        {compatibility.length > 0 && (
                            <FieldGroup label="Kompatibilita">
                                <BulletList items={compatibility} />
                            </FieldGroup>
                        )}

                        {notes.length > 0 && (
                            <FieldGroup label="Poznámky">
                                <BulletList items={notes} />
                            </FieldGroup>
                        )}
                    </Section>
                )}
            </div>

            {hasSidebar && (
                <aside className="model-detail__sidebar">
                    {showTechnical && (
                        <dl className="model-detail__facts">
                            {technical.map((item) => (
                                <div className="model-detail__fact" key={item.label}>
                                    <dt className="model-detail__fact-label">{item.label}</dt>

                                    <dd className="model-detail__fact-value">
                                        {item.value}

                                        {item.note && (
                                            <span className="model-detail__fact-note">{item.note}</span>
                                        )}
                                    </dd>
                                </div>
                            ))}
                        </dl>
                    )}

                    {showDeployment && (
                        <Section title="Nasazení a použití">
                            {deploymentSteps.length > 1
                                ? <FlowDiagram steps={deploymentSteps} />
                                : deployment.length > 0 && <ChipList items={deployment} />}

                            {settings.length > 0 && (
                                <FieldGroup label="Doporučené nastavení">
                                    <BulletList items={settings} />
                                </FieldGroup>
                            )}

                            <Note>Uvedeno v dokumentaci modelu.</Note>
                        </Section>
                    )}

                    {showPerformance && (
                        <Section title="Výkon">
                            <BenchmarkGroups groups={groupBenchmarks(performanceBenchmarks)} />

                            <Note>Uvedeno autory modelu. Délka pruhu odpovídá uvedenému výsledku.</Note>
                        </Section>
                    )}

                    {showOtherBenchmarks && (
                        <Section title="Benchmarky">
                            <BenchmarkGroups groups={groupBenchmarks(otherBenchmarks)} />

                            <Note>Uvedeno autory modelu.</Note>
                        </Section>
                    )}

                    {showEfficiency && (
                        <Section title="Latence a efektivita">
                            {efficiencyBenchmarks.length > 0 && (
                                <BenchmarkGroups groups={groupBenchmarks(efficiencyBenchmarks)} />
                            )}

                            {quantization.length > 0 && (
                                <FieldGroup label="Kvantizace a formáty">
                                    <BulletList items={quantization} />
                                </FieldGroup>
                            )}

                            {hardware.length > 0 && (
                                <FieldGroup label="Nároky na hardware">
                                    <BulletList items={hardware} />
                                </FieldGroup>
                            )}

                            <Note>Uvedeno v dokumentaci modelu.</Note>
                        </Section>
                    )}
                </aside>
            )}
        </article>
    );
}

export default ModelDetail;
