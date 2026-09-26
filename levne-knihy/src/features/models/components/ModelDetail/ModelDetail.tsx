import "./ModelDetail.css";

import { AIModel, ModelBenchmark, ModelInsights } from "../../types";
import { formatCount, formatDate, formatLanguages, formatParameters } from "../../utils/formatters";
import { getModelLicense, getModelProvider, getModelTagList } from "../../utils/modelCard";
import { DetailItem, LinkButton, PageTitle, SectionTitle } from "@/ui";

import ModelImage from "../ModelList/ModelImage";
import ModelReadme from "../ModelReadme/ModelReadme";

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

/** Zobrazuje detail modelu – přehled, oblasti použití, technické údaje, omezení a původní dokumentaci. */
function ModelDetail({ model, cardContent, isCardLoading, insights, isInsightsLoading }: {
    model: AIModel;
    // Text model card dorazí až po modelu (načítá se zvlášť)
    cardContent: string | null;
    isCardLoading: boolean;
    // Přehledy z dokumentace (mohou dorazit později, nebo vůbec)
    insights: ModelInsights | null;
    isInsightsLoading: boolean;
}) {
    const tags = getModelTagList(model);

    // Popisek: přednost má český přehled z dokumentace, jinak uložený popisek modelu
    const summary = insights?.overview?.trim() || model.description?.trim();

    // Oblasti použití z dokumentace, když v ní nic není, použije se úloha a štítky modelu
    const fromDocs = [...new Set([...(insights?.bestFor ?? []), ...(insights?.capabilities ?? [])])];

    const bestFor = fromDocs.length > 0
        ? fromDocs
        : (tags.secondary.length > 0 ? tags.secondary : (tags.primary ? [tags.primary] : []));

    const limitations = insights?.limitations ?? [];

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

    // Technické údaje se vypíšou jen tehdy, když je model skutečně má
    const technical = [
        { label: "Parametry", value: model.parameters === null ? null : formatParameters(model.parameters) },
        { label: "Kontext", value: insights?.contextLength ?? null },
        { label: "Nasazení", value: insights?.inferenceFrameworks?.length ? insights.inferenceFrameworks.join(", ") : null },
        { label: "Knihovna", value: model.library },
        { label: "Licence", value: model.license ? getModelLicense(model.license) : null },
        { label: "Jazyky", value: model.languages?.length ? formatLanguages(model.languages, 12) : null },
        { label: "Aktualizace", value: model.lastModified ? formatDate(model.lastModified) : null },
    ].filter((item): item is { label: string; value: string } => Boolean(item.value));

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
                </div>
            </header>

            {isInsightsLoading && !insights && (
                <p className="model-detail__note">Zpracovávám dokumentaci modelu…</p>
            )}

            {summary && (
                <section className="model-detail__section">
                    <SectionTitle>Přehled</SectionTitle>

                    <p className="model-detail__summary">{summary}</p>
                </section>
            )}

            {bestFor.length > 0 && (
                <section className="model-detail__section">
                    <SectionTitle>Nejvhodnější pro</SectionTitle>

                    <ul className="model-detail__chips">
                        {bestFor.map((item) => (
                            <li className="model-detail__chip" key={item}>
                                {item}
                            </li>
                        ))}
                    </ul>

                    <p className="model-detail__note">
                        {fromDocs.length > 0
                            ? "Vychází z dokumentace modelu na Hugging Face."
                            : "Vychází z úlohy a štítků modelu na Hugging Face."}
                    </p>
                </section>
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

                    <ul className="model-detail__limitations">
                        {limitations.map((item) => (
                            <li key={item}>{item}</li>
                        ))}
                    </ul>
                </section>
            )}

            {cardContent
                ? <ModelReadme modelId={model.modelId} content={cardContent} />
                : isCardLoading && <p className="model-detail__card-note">Načítám text model card…</p>}

            <LinkButton
                href={model.url}
                variant="outline"
                className="model-detail__link"
            >
                Zobrazit původní dokumentaci na Hugging Face
            </LinkButton>
        </article>
    );
}

export default ModelDetail;
