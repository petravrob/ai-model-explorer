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
    LinkButton,
    MetricGrid,
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

/**
 * Detail modelu - souhrn toho, co model umí, na co se hodí, jak se nasazuje
 * a na co si dát pozor.
 *
 * Stránka je záměrně souhrn (není chtěné pouze vytvořit překlad README z Hugging Face).
 */
function ModelDetail({ model, insights }: {
    model: AIModel;
    // Přehledy z dokumentace (mohou dorazit později, nebo vůbec)
    insights: ModelInsights | null;
}) {
    const tags = getModelTagList(model);

    // Přehled: přednost má český text z dokumentace, jinak popisek modelu
    const overview = insights?.overview?.trim() || model.description?.trim() || getModelSummary(model);

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

    // "Jak funguje" se skládá z odstavců, aby se text dal dobře číst
    const howItWorks = (insights?.howItWorks ?? "")
        .split(/\n{2,}/)
        .map((paragraph) => paragraph.trim())
        .filter(Boolean);

    // Varianta se stejným názvem, jako má model sám, se neuvádí
    const variants = (insights?.variants ?? []).filter((variant) => !isModelItself(model, variant));

    // U modelů typu MoE se rozlišují celkové a aktivní parametry
    const totalParameters = model.parameters === null ? null : formatParameters(model.parameters);
    const parameterNote = totalParameters && insights?.activeParameters
        ? `aktivně ${insights.activeParameters}`
        : undefined;

    // Druhy vstupů a výstupů modelu jako odznaky s ikonou
    const modalityBadges = insights?.modalities ?? [];

    // Stručný profil hned pod hlavičkou – jen údaje, které model skutečně má
    const capabilityItems = [
        { label: "Úloha", value: tags.primary ?? null },
        { label: "Parametry", value: totalParameters ?? (insights?.activeParameters ? `${insights.activeParameters} aktivně` : null) },
        { label: "Kontext", value: insights?.contextLength ?? null },
        { label: "Architektura", value: insights?.architecture ?? null },
        { label: "Knihovna", value: model.library },
        { label: "Licence", value: model.license ? getModelLicense(model.license) : null },
    ].filter((item): item is MetricItem => Boolean(item.value));

    // Technické údaje se vypíšou jen tehdy, když je model skutečně má
    const technical = [
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

    // Schéma zapojení se kreslí jen tehdy, když dokumentace architekturu uvádí
    const flowSteps = insights?.architecture
        ? [
            insights.modalities?.length ? `Vstup: ${insights.modalities.join(", ")}` : null,
            insights.architecture,
            tags.primary ? `Výstup: ${tags.primary}` : null,
        ].filter((step): step is string => Boolean(step))
        : [];

    // Skládanka nasazení: doložené nástroje a nároky na provoz
    const deploymentSteps = [...deployment.slice(0, 4), ...hardware.slice(0, 2)];

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

    // Pruhy u benchmarků mají smysl jen u výsledků vyjádřených v procentech
    const hasBenchmarkBars = (insights?.benchmarks ?? []).some((benchmark) => getBenchmarkPercent(benchmark) !== null);

    // Benchmarky se seskupí podle oblasti, pokud ji dokumentace uvádí
    const benchmarkGroups = (insights?.benchmarks ?? []).reduce<{ category: string | null; items: ModelBenchmark[] }[]>(
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

    // Štítky v hlavičce: hlavní úloha a doplňkové štítky modelu
    const headerTags = [tags.primary, ...tags.secondary]
        .filter(Boolean)
        .slice(0, MAX_HEADER_TAGS) as string[];

    return (
        <article className="model-detail">
            <header className="model-detail__hero">
                <ModelImage
                    className="model-detail__image"
                    name={model.name}
                    author={model.author}
                    avatarUrl={model.avatarUrl}
                />

                <div className="model-detail__identity">
                    <PageTitle>{model.name}</PageTitle>

                    <p className="model-detail__provider">{getModelProvider(model.author)}</p>

                    {headerTags.length > 0 && <ChipList items={headerTags} />}

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

                    <a className="model-detail__hero-link" href={model.url} target="_blank" rel="noreferrer">
                        Hugging Face ↗
                    </a>
                </div>
            </header>

            {(modalityBadges.length > 0 || capabilityItems.length > 0) && (
                <div className="model-detail__profile">
                    {modalityBadges.length > 0 && <ModalityBadges items={modalityBadges} />}

                    {capabilityItems.length > 0 && <MetricGrid items={capabilityItems} />}
                </div>
            )}

            {overview && (
                <Section title="Přehled">
                    <p className="model-detail__summary">{overview}</p>
                </Section>
            )}

            {(highlights.length > 0 || bestFor.length > 0) && (
                <div className="model-detail__split">
                    {highlights.length > 0 && (
                        <Section title="Proč tento model?">
                            <BulletList variant="check" items={highlights} />
                        </Section>
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
                </div>
            )}

            {howItWorks.length > 0 && (
                <Section title="Jak funguje">
                    {howItWorks.map((paragraph) => (
                        <p className="model-detail__text" key={paragraph}>{paragraph}</p>
                    ))}

                    {flowSteps.length > 1 && (
                        <>
                            <FlowDiagram steps={flowSteps} />

                            <Note>Schéma vychází z dokumentace modelu.</Note>
                        </>
                    )}
                </Section>
            )}

            {technical.length > 0 && (
                <Section title="Technické informace">
                    <MetricGrid items={technical} />
                </Section>
            )}

            {(deployment.length > 0 || settings.length > 0) && (
                <Section title="Nasazení a použití">
                    {deploymentSteps.length > 1
                        ? <FlowDiagram steps={deploymentSteps} />
                        : deployment.length > 0 && <ChipList items={deployment} />}

                    {settings.length > 0 && (
                        <FieldGroup label="Doporučené nastavení">
                            <BulletList items={settings} />
                        </FieldGroup>
                    )}

                    {hardware.length > 0 && (
                        <FieldGroup label="Nároky na hardware">
                            <BulletList items={hardware} />
                        </FieldGroup>
                    )}

                    {quantization.length > 0 && (
                        <FieldGroup label="Kvantizace a formáty">
                            <BulletList items={quantization} />
                        </FieldGroup>
                    )}

                    <Note>Uvedeno v dokumentaci modelu.</Note>
                </Section>
            )}

            {benchmarkGroups.length > 0 && (
                <Section title="Výkon">
                    <div className="model-detail__benchmarks">
                        {benchmarkGroups.map((group) => (
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

                    <Note>
                        {hasBenchmarkBars
                            ? "Uvedeno autory modelu. Délka pruhu odpovídá uvedenému výsledku."
                            : "Uvedeno autory modelu."}
                    </Note>
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

            <Section title="Dokumentace">
                <div className="model-detail__documentation">
                    <p>
                        Celý text model card najdeš na Hugging Face. Tahle stránka z něj přebírá
                        jen strukturované údaje výše.
                    </p>

                    <LinkButton href={model.url} variant="outline">
                        Otevřít dokumentaci na Hugging Face
                    </LinkButton>
                </div>
            </Section>
        </article>
    );
}

export default ModelDetail;
