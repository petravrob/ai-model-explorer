import "./MetricGrid.css";

export interface MetricItem {
    label: string;
    // Zvýrazněná hodnota (už naformátovaná)
    value: string;
    // Doplňující údaj pod hodnotou (např. aktivně 2,7 B)
    note?: string;
}

interface MetricGridProps {
    items: MetricItem[];
    className?: string;
}

/** Mřížka klíčových údajů o modelu - popisek, výrazná hodnota a doplňující poznámka. */
function MetricGrid({ items, className }: MetricGridProps) {
    return (
        <dl className={className ? `metric-grid ${className}` : "metric-grid"}>
            {items.map((item) => (
                <div className="metric-grid__item" key={item.label}>
                    <dt className="metric-grid__label">{item.label}</dt>

                    <dd className="metric-grid__value">
                        {item.value}

                        {item.note && <span className="metric-grid__note">{item.note}</span>}
                    </dd>
                </div>
            ))}
        </dl>
    );
}

export default MetricGrid;
