import "./CheckboxGroup.css";

import { useState } from "react";

import CheckboxGroupHeader from "../CheckboxGroupHeader/CheckboxGroupHeader";
import CheckboxGroupOptions from "../CheckboxGroupOptions/CheckboxGroupOptions";
import { countSelected, limitOptions, toDisplayOptions } from "../checkboxGroupOptionUtils";
import type { CheckboxGroupOption } from "../checkboxGroupTypes";

interface CheckboxGroupProps {
    title: string;
    // Ikona u názvu podkategorie - SVG cesta (viewBox 24×24)
    icon?: string;
    options: readonly CheckboxGroupOption[];
    selected: string[];
    onToggle: (value: string) => void;
    // Kolik hodnot se ukáže ve zkrácené nabídce
    visibleValues: number;
}

/** Kategorie filtrů (hodnoty se dají skrýt). */
function CheckboxGroup({ title, icon, options, selected, onToggle, visibleValues }: CheckboxGroupProps) {
    const [isOpen, setIsOpen] = useState(true);

    // Nabídka zobrazuje kategorii s méně hodnotami, aby zůstaly vidět i ostatní kategorie filtrů
    const [showAllOptions, setShowAllOptions] = useState(false);

    const selectedCount = countSelected(options, selected);

    // Počítá se počet nezobrazených hodnot ("Zobrazit další ??")
    const collapsedOptions = limitOptions(options, selected, visibleValues);

    const visibleOptions = showAllOptions ? toDisplayOptions(options) : collapsedOptions.items;

    return (
        <section className="checkbox-group">
            <CheckboxGroupHeader
                title={title}
                icon={icon}
                isOpen={isOpen}
                selectedCount={selectedCount}
                onToggle={() => setIsOpen((open) => !open)}
            />

            {isOpen && (
                <div className="checkbox-group__content">
                    <CheckboxGroupOptions
                        options={visibleOptions}
                        selected={selected}
                        onToggle={onToggle}
                    />

                    {collapsedOptions.hiddenCount > 0 && (
                        <button
                            type="button"
                            className="checkbox-group__more"
                            aria-expanded={showAllOptions}
                            onClick={() => setShowAllOptions((showAll) => !showAll)}
                        >
                            {showAllOptions
                                ? "Zobrazit méně"
                                : `Zobrazit další (${collapsedOptions.hiddenCount})`}
                        </button>
                    )}
                </div>
            )}
        </section>
    );
}

export default CheckboxGroup;
