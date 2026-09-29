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
    onApply,
}: ModelFilterPanelProps) {

    return (
        <aside className="model-filter-panel">
            <div className="model-filter-panel__header">
                <Icon path={FILTER_ICON} className="model-filter-panel__icon" />

                <PageTitle compact>Filtry</PageTitle>

                {/* "Vymazat vše" zůstává ve stejném řádku jako nadpis, aby se filtry při zvolení neposouvaly */}
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

            {/* Na telefonu je potvrzení filtrů u dolního okraje stránky (filtry se zvolí a stránka se zavře) */}
            <div className="model-filter-panel__actions">
                <Button className="model-filter-panel__apply" onClick={onApply}>
                    Hotovo
                </Button>
            </div>
        </aside>
    );
}

export default ModelFilterPanel;
