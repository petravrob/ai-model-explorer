import "./ModelFilterPanel.css";

import { Button, CheckboxGroup } from "@/ui";

import { ModelFilterPanelProps } from "../../types";
import { MODEL_FILTERS_CONFIG } from "../../modelFiltersConfig";

/** Zobrazuje levý panel s předvolbami, podle kterých se filtrují modely. */
function ModelFilterPanel({
    filters,
    isFilterActive,
    onFilterChange,
    onReset,
}: ModelFilterPanelProps) {

    return (
        <aside className="model-filter-panel">
            <h2 className="model-filter-panel__title">Předvolby</h2>

            {/* Kategorie i jejich nabídka hodnot se řídí konfigurací předvoleb */}
            {MODEL_FILTERS_CONFIG.map((filterConfig) => (

                <CheckboxGroup
                    key={filterConfig.key}
                    title={filterConfig.title}
                    options={filterConfig.options}
                    selected={filters[filterConfig.key]}
                    onToggle={(value: string) =>
                        onFilterChange(filterConfig.key, value)
                    }
                />
            ))}

            {isFilterActive && (
                <Button
                    variant="outline"
                    className="model-filter-panel__reset"
                    onClick={onReset}
                >
                    Vymazat předvolby
                </Button>
            )}
        </aside>
    );
}

export default ModelFilterPanel;

