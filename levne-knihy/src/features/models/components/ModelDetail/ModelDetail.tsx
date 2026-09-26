import "./ModelDetail.css";

import { AIModel, ModelBenchmark, ModelInsights } from "../../types";
import { formatCount, formatDate, formatLanguages, formatParameters } from "../../utils/formatters";
import { getModelLicense, getModelProvider, getModelSummary, getModelTagList, isModelItself } from "../../utils/modelCard";
import { getModelHighlights } from "../../utils/modelHighlights";
import {
    ChipList,
    DetailItem,
    DOWNLOAD_ICON,
    LIKE_ICON,
    LinkButton,
    MISSING_VALUE,
    Note,
    PageTitle,
    Section,
    Stat,
} from "@/ui";

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
function ModelDetail({ model, insights, isInsightsLoading }: {
    model: AIModel;
    // Přehledy z dokumentace (mohou dorazit později, nebo vůbec)
    insights: ModelInsights | null;
    isInsightsLoading: boolean;
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
    const notes = insights?.notes ?? [];

    // Varianta se stejným názvem, jako má model sám, se neuvádí
    const variants = (insights?.variants ?? []).filter((variant) => !isModelItself(model, variant));

    // U modelů typu MoE se rozlišují celkové a aktivní parametry
    const parameters = insights?.activeParameters
        ? (model.parameters === null
            ? `${insights.activeParameters} aktivně`
            : `${formatParameters(model.parameters)} celkem, ${insights.activeParameters} aktivně`)
        : formatParameters(model.parameters);

    // Technické údaje se vypíšou jen tehdy, když je model skutečně má
    const technical = [
        { label: "Parametry", value: parameters === MISSING_VALUE ? null : parameters },
        { label: "Architektura", value: insights?.architecture ?? null },
        { label: "Kontext", value: insights?.contextLength ?? null },
        { label: "Verze", value: insights?.version ?? null },
        { label: "Knihovna", value: model.library },
        { label: "Licence", value: model.license ? getModelLicense(model.license) : null },
        { label: "Jazyky", value: model.languages?.length ? formatLanguages(model.languages, 12) : null },
        { label: "Aktualizace", value: model.lastModified ? formatDate(model.lastModified) : null },
    ].filter((item): item is { label: string; value: string } => Boolean(item.value));

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
                    task={model.task}
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

            {overview && (
                <Section title="Přehled">
                    <p className="model-detail__summary">{overview}</p>
                </Section>
            )}

            {isInsightsLoading && !insights && (
                <Note>Zpracovávám dokumentaci modelu…</Note>
            )}

            {(highlights.length > 0 || bestFor.length > 0) && (
                <div className="model-detail__split">
                    {highlights.length > 0 && (
                        <Section title="Proč tento model?">
                            <ul className="model-detail__highlights">
                                {highlights.map((item) => (
                                    <li key={item}>{item}</li>
                                ))}
                            </ul>
                        </Section>
                    )}

                    {bestFor.length > 0 && (
                        <Section title="Nejvhodnější pro">
                            <ChipList items={bestFor} />

                            <Note>
                                {documentedAreas.length > 0
                                    ? "Vychází z dokumentace modelu na Hugging Face."
                                    : "Vychází z úlohy a štítků modelu na Hugging Face."}
                            </Note>
                        </Section>
                    )}
                </div>
            )}

            {insights?.howItWorks && (
                <Section title="Jak funguje">
                    <p className="model-detail__text">{insights.howItWorks}</p>
                </Section>
            )}

            {technical.length > 0 && (
                <Section title="Technické informace">
                    <div className="model-detail__details">
                        {technical.map((item) => (
                            <DetailItem label={item.label} value={item.value} key={item.label} />
                        ))}
                    </div>
                </Section>
            )}

            {(deployment.length > 0 || settings.length > 0) && (
                <Section title="Nasazení a použití">
                    {deployment.length > 0 && <ChipList items={deployment} />}

                    {settings.length > 0 && (
                        <div className="model-detail__group">
                            <p className="model-detail__label">Doporučené nastavení</p>

                            <ul className="model-detail__list">
                                {settings.map((item) => (
                                    <li key={item}>{item}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {hardware.length > 0 && (
                        <div className="model-detail__group">
                            <p className="model-detail__label">Nároky na hardware</p>

                            <ul className="model-detail__list">
                                {hardware.map((item) => (
                                    <li key={item}>{item}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    <Note>Uvedeno v dokumentaci modelu.</Note>
                </Section>
            )}

            {benchmarkGroups.length > 0 && (
                <Section title="Výkon">
                    <div className="model-detail__benchmarks">
                        {benchmarkGroups.map((group) => (
                            <div className="model-detail__benchmark-group" key={group.category ?? "bez kategorie"}>
                                {group.category && (
                                    <p className="model-detail__benchmark-category">{group.category}</p>
                                )}

                                {group.items.map((benchmark) => (
                                    <p className="model-detail__benchmark" key={`${benchmark.name}-${benchmark.score}`}>
                                        <span className="model-detail__benchmark-name">{benchmark.name}</span>
                                        <strong className="model-detail__benchmark-score">{benchmark.score}</strong>

                                        {(benchmark.metric || benchmark.context) && (
                                            <span className="model-detail__benchmark-meta">
                                                {[benchmark.metric, benchmark.context].filter(Boolean).join(" · ")}
                                            </span>
                                        )}
                                    </p>
                                ))}
                            </div>
                        ))}
                    </div>

                    <Note>Uvedeno autory modelu.</Note>
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
                    {insights?.baseModel && (
                        <div className="model-detail__details">
                            <DetailItem label="Vychází z modelu" value={insights.baseModel} />
                        </div>
                    )}

                    {variants.length > 0 && (
                        <div className="model-detail__group">
                            <p className="model-detail__label">Varianty</p>

                            <ChipList items={variants} />
                        </div>
                    )}

                    {notes.length > 0 && (
                        <div className="model-detail__group">
                            <p className="model-detail__label">Poznámky</p>

                            <ul className="model-detail__list">
                                {notes.map((item) => (
                                    <li key={item}>{item}</li>
                                ))}
                            </ul>
                        </div>
                    )}
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
