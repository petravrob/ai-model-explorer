import type { MetricItem } from "@/ui";

import { Section } from "@/ui";

export interface ModelFactItem extends MetricItem {
    // Stručné vysvětlení, co údaj znamená (pro běžného uživatele)
    description: string;
}

interface ModelFactsProps {
    items: ModelFactItem[];
}

/** Technické údaje modelu */
function ModelFacts({ items }: ModelFactsProps) {
    return (
        <Section title="Technické údaje">
            <dl className="model-detail__facts">
                {items.map((item) => (
                    <div className="model-detail__fact" key={item.label} title={item.description}>
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
        </Section>
    );
}

export default ModelFacts;
