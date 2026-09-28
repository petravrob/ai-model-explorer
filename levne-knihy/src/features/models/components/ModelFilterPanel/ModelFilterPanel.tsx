import "./ModelFilterPanel.css";

import { useState } from "react";

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

    // Na obrazovce počítače jsou filtry vidět pořád, na telefonu se rozbalují tlačítkem
    const [isOpen, setIsOpen] = useState(false);

    return (
        <aside className={`model-filter-panel${isOpen ? " model-filter-panel--open" : ""}`}>
            <div className="model-filter-panel__header">
                <Icon path={FILTER_ICON} className="model-filter-panel__icon" />

                <PageTitle compact>Filtry</PageTitle>

                <button
                    type="button"
                    className="model-filter-panel__toggle"
                    aria-expanded={isOpen}
                    aria-controls="model-filter-categories"
                    onClick={() => setIsOpen((open) => !open)}
                >
                    Filtry

                    <span className="model-filter-panel__chevron" aria-hidden="true" />
                </button>

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
