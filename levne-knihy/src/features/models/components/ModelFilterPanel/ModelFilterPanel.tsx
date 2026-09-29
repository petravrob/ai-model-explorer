import "./ModelFilterPanel.css";

import { Button, CheckboxGroup, FILTER_ICON, Icon, PageTitle } from "@/ui";

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
                <Icon path={FILTER_ICON} className="model-filter-panel__icon" />

                <PageTitle compact>Filtry</PageTitle>

                {isFilterActive && (
                    <Button
                        variant="outline"
                        className="model-filter-panel__reset"
                        onClick={onReset}
                    >
                        Vymazat vše
                    </Button>
                )}
            </div>

            <div
                className="model-filter-panel__categories"
                id="model-filter-categories"
            >
                {/* Na telefonu je "Vymazat vše" nahoře */}
                {isFilterActive && (
                    <Button
                        variant="outline"
                        className="model-filter-panel__reset model-filter-panel__reset--mobile"
                        onClick={onReset}
                    >
                        Vymazat vše
                    </Button>
                )}

                {MODEL_FILTERS_CONFIG.map((filterConfig) => (
                    <CheckboxGroup
                        key={filterConfig.key}
                        title={filterConfig.title}
                        icon={filterConfig.icon}
                        visibleValues={filterConfig.visibleValues}
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
