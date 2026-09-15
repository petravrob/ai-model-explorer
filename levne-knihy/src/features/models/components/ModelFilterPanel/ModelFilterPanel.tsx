import "./ModelFilterPanel.css";

import { Button, CheckboxGroup, PageTitle } from "@/ui";

import { ModelFilterPanelProps } from "../../types";
import { MODEL_FILTERS_CONFIG } from "../../filters";

/** Zobrazuje levý panel s filtry, podle kterých se filtrují modely. */
function ModelFilterPanel({
    filters,
    isFilterActive,
    onFilterChange,
    onReset,
}: ModelFilterPanelProps) {
    return (
        <aside className="model-filter-panel">
            <div className="model-filter-panel__header">
                <PageTitle compact>Filtry</PageTitle>

                <div className="model-filter-panel__actions">
                    {isFilterActive && (
                        <Button
                            variant="outline"
                            className="model-filter-panel__reset"
                            onClick={onReset}
                        >
                            Vymazat filtry
                        </Button>
                    )}
                </div>
            </div>

            <div className="model-filter-panel__categories">
                {MODEL_FILTERS_CONFIG.map((filterConfig) => (
                    <CheckboxGroup
                        key={filterConfig.key}
                        filterKey={filterConfig.key}
                        title={filterConfig.title}
                        icon={filterConfig.icon}
                        options={filterConfig.options}
                        selected={filters[filterConfig.key]}
                        onToggle={(value: string) =>
                            onFilterChange(filterConfig.key, value)
                        }
                    />
                ))}
            </div>
        </aside>
    );
}

export default ModelFilterPanel;
