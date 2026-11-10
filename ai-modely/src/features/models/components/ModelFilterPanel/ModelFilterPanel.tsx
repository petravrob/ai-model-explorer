import "./ModelFilterPanel.css";

import { useTranslation } from "react-i18next";

import { Button, CheckboxGroup, FILTER_ICON, Icon, PageTitle } from "@/ui";

import { ModelFilterPanelProps } from "../../types";
import { MODEL_FILTERS_CONFIG, translateFilterOptions } from "../../filters";

/** Zobrazuje levý panel s filtry, podle kterých se filtrují modely. */
function ModelFilterPanel({
    filters,
    isFilterActive,
    onFilterChange,
    onReset,
    onApply,
}: ModelFilterPanelProps) {
    const { t } = useTranslation("models");

    return (
        <aside className="model-filter-panel">
            <div className="model-filter-panel__header">
                <Icon path={FILTER_ICON} className="model-filter-panel__icon" />

                <PageTitle compact>{t("filters.title")}</PageTitle>

                {/* "Vymazat vše" zůstává ve stejném řádku jako nadpis, aby se filtry při zvolení neposouvaly */}
                {isFilterActive && (
                    <Button
                        variant="outline"
                        className="model-filter-panel__reset"
                        onClick={onReset}
                    >
                        {t("filters.clearAll")}
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
                        title={t(filterConfig.titleKey)}
                        icon={filterConfig.icon}
                        visibleValues={filterConfig.visibleValues}
                        options={translateFilterOptions(filterConfig.options)}
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
                    {t("filters.apply")}
                </Button>
            </div>
        </aside>
    );
}

export default ModelFilterPanel;
