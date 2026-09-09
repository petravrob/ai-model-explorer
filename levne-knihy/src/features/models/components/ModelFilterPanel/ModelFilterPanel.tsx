import "./ModelFilterPanel.css";

import { Button, CheckboxGroup } from "@/ui";

import { ModelFilterPanelProps } from "../../types";

/** Zobrazuje levý panel s předvolbami, podle kterých se filtrují modely. */
function ModelFilterPanel({
    filters,
    options,
    isFilterActive,
    onFilterChange,
    onReset,
}: ModelFilterPanelProps) {

    // Zaškrtnutím nebo odškrtnutím se hodnota přidá či odebere z vybraných úloh
    const handleToggleTask = (task: string): void =>
        onFilterChange("tasks", task);

    return (
        <aside className="model-filter-panel">
            <h2 className="model-filter-panel__title">Předvolby</h2>

            <CheckboxGroup
                title="Úloha"
                options={options.tasks}
                selected={filters.tasks}
                onToggle={handleToggleTask}
            />

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