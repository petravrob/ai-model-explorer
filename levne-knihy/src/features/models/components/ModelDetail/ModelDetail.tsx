import "./ModelDetail.css";

import { AIModel, ModelBenchmark, ModelInsights } from "../../types";
import { formatCount, formatDate, formatLanguages, formatParameters } from "../../utils/formatters";
import { getModelLicense, getModelProvider, getModelSummary, getModelTagList } from "../../utils/modelCard";
import { getModelHighlights } from "../../utils/modelHighlights";
import { DetailItem, LinkButton, MISSING_VALUE, PageTitle, SectionTitle } from "@/ui";

import ModelImage from "../ModelList/ModelImage";

// Ikony v hlavičce detailu (SVG cesty pro viewBox 24×24)
const DOWNLOAD_ICON = "M12 3v12M7 10l5 5 5-5M5 21h14";
const LIKE_ICON = "M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8L12 21.2l8.8-8.8a5.5 5.5 0 0 0 0-7.8z";

/** Ikona detailu ze SVG cesty, barvu dědí z okolního textu. */
function DetailIcon({ path }: { path: string }) {
    return (
        <svg
            className="model-detail__icon"
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

    // Vlastnosti, které model odlišují (nesmí se opakovat s ostatními sekcemi)
    const highlights = getModelHighlights(model, insights);

    const limitations = insights?.limitations ?? [];
    const deployment = insights?.inferenceFrameworks ?? [];
    const settings = insights?.recommendedSettings ?? [];

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

                    {headerTags.length > 0 && (
                        <ul className="model-detail__chips">
                            {headerTags.map((tag) => (
                                <li className="model-detail__chip" key={tag}>{tag}</li>
                            ))}
                        </ul>
                    )}

                    <div className="model-detail__stats">
                        <span className="model-detail__stat">
                            <DetailIcon path={DOWNLOAD_ICON} />
                            <strong>{formatCount(model.downloads)}</strong> stažení
                        </span>

                        <span className="model-detail__stat">
                            <DetailIcon path={LIKE_ICON} />
                            <strong>{formatCount(model.likes)}</strong> oblíbení
                        </span>
                    </div>

                    <a className="model-detail__hero-link" href={model.url} target="_blank" rel="noreferrer">
                        Hugging Face ↗
                    </a>
                </div>
            </header>

            {overview && (
                <section className="model-detail__section">
                    <SectionTitle>Přehled</SectionTitle>

                    <p className="model-detail__summary">{overview}</p>
                </section>
            )}

            {isInsightsLoading && !insights && (
                <p className="model-detail__note">Zpracovávám dokumentaci modelu…</p>
            )}

            {(highlights.length > 0 || bestFor.length > 0) && (
                <div className="model-detail__split">
                    {highlights.length > 0 && (
                        <section className="model-detail__section">
                            <SectionTitle>Proč tento model?</SectionTitle>

                            <ul className="model-detail__highlights">
                                {highlights.map((item) => (
                                    <li key={item}>{item}</li>
                                ))}
                            </ul>
                        </section>
                    )}

                    {bestFor.length > 0 && (
                        <section className="model-detail__section">
                            <SectionTitle>Nejvhodnější pro</SectionTitle>

                            <ul className="model-detail__chips">
                                {bestFor.map((item) => (
                                    <li className="model-detail__chip" key={item}>{item}</li>
                                ))}
                            </ul>

                            <p className="model-detail__note">
                                {documentedAreas.length > 0
                                    ? "Vychází z dokumentace modelu na Hugging Face."
                                    : "Vychází z úlohy a štítků modelu na Hugging Face."}
                            </p>
                        </section>
                    )}
                </div>
            )}

            {technical.length > 0 && (
                <section className="model-detail__section">
                    <SectionTitle>Technické informace</SectionTitle>

                    <div className="model-detail__details">
                        {technical.map((item) => (
                            <DetailItem label={item.label} value={item.value} key={item.label} />
                        ))}
                    </div>
                </section>
            )}

            {(deployment.length > 0 || settings.length > 0) && (
                <section className="model-detail__section">
                    <SectionTitle>Nasazení a použití</SectionTitle>

                    {deployment.length > 0 && (
                        <ul className="model-detail__chips">
                            {deployment.map((item) => (
                                <li className="model-detail__chip" key={item}>{item}</li>
                            ))}
                        </ul>
                    )}

                    {settings.length > 0 && (
                        <div className="model-detail__settings-block">
                            <p className="model-detail__label">Doporučené nastavení</p>

                            <ul className="model-detail__settings">
                                {settings.map((item) => (
                                    <li key={item}>{item}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    <p className="model-detail__note">Uvedeno v dokumentaci modelu.</p>
                </section>
            )}

            {benchmarkGroups.length > 0 && (
                <section className="model-detail__section">
                    <SectionTitle>Výkon</SectionTitle>

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

                    <p className="model-detail__note">Uvedeno autory modelu.</p>
                </section>
            )}

            {limitations.length > 0 && (
                <section className="model-detail__section">
                    <SectionTitle>Omezení</SectionTitle>

                    <div className="model-detail__panel">
                        <ul className="model-detail__limitations">
                            {limitations.map((item) => (
                                <li key={item}>{item}</li>
                            ))}
                        </ul>
                    </div>
                </section>
            )}

            <section className="model-detail__section">
                <SectionTitle>Dokumentace</SectionTitle>

                <div className="model-detail__documentation">
                    <p>
                        Celý text model card najdeš na Hugging Face. Tahle stránka z něj přebírá
                        jen strukturované údaje výše.
                    </p>

                    <LinkButton href={model.url} variant="outline">
                        Otevřít dokumentaci na Hugging Face
                    </LinkButton>
                </div>
            </section>
        </article>
    );
}

export default ModelDetail;
