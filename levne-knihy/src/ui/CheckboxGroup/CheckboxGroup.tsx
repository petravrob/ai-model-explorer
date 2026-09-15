import "./CheckboxGroup.css";

import { useState } from "react";

import Checkbox from "../Checkbox/Checkbox";

/** Jedna hodnota v nabídce skupiny zaškrtávacích polí. */
export interface CheckboxGroupOption {
    value: string;
    label: string;
    // Ikona u popisku podkategorie – SVG cesta (viewBox 24×24)
    icon?: string;
    children?: readonly CheckboxGroupOption[];
}

interface CheckboxGroupProps {
    filterKey: string;
    title: string;
    // Ikona u názvu skupiny – SVG cesta (viewBox 24×24)
    icon?: string;
    options: readonly CheckboxGroupOption[];
    selected: string[];
    onToggle: (value: string) => void;
}

/** Vykreslí ikonu ze SVG cesty (viewBox 24×24), barva se dědí z textu. */
function FilterIcon({ path, className }: { path: string; className: string }) {
    return (
        <svg
            className={className}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            <path d={path} />
        </svg>
    );
}

function countSelected(
    options: readonly CheckboxGroupOption[],
    selected: string[]
): number {
    return options.reduce((count, option) => {
        const isSelected = selected.includes(option.value);

        const childrenCount = option.children
            ? countSelected(option.children, selected)
            : 0;

        return count + (isSelected ? 1 : 0) + childrenCount;
    }, 0);
}

/** Skupina filtrů s možností rozbalení jednotlivých hodnot. */
function CheckboxGroup({
    filterKey,
    title,
    icon,
    options,
    selected,
    onToggle,
}: CheckboxGroupProps) {
    const [isOpen, setIsOpen] = useState(false);

    const selectedCount = countSelected(options, selected);

    const renderOptions = (items: readonly CheckboxGroupOption[]) => (
        <ul className="checkbox-group__options">
            {items.map((option) => {
                const hasChildren = Boolean(option.children?.length);

                return (
                    <li
                        key={option.value}
                        className={
                            hasChildren
                                ? "checkbox-group__group-item"
                                : "checkbox-group__option-item"
                        }
                    >
                        {hasChildren ? (
                            <div className="checkbox-group__group">
                                <span
                                    className={`checkbox-group__group-label${
                                        option.icon ? " checkbox-group__group-label--icon" : ""
                                    }`}
                                >
                                    {option.icon && (
                                        <FilterIcon
                                            path={option.icon}
                                            className="checkbox-group__group-icon"
                                        />
                                    )}
                                    {option.label}
                                </span>

                                {renderOptions(option.children ?? [])}
                            </div>
                        ) : (
                            <Checkbox
                                label={option.label}
                                checked={selected.includes(option.value)}
                                onChange={() => onToggle(option.value)}
                            />
                        )}
                    </li>
                );
            })}
        </ul>
    );

    return (
        <section
            className={`checkbox-group ${
                isOpen ? "checkbox-group--open" : ""
            }`}
            data-filter={filterKey}
        >
            <button
                type="button"
                className="checkbox-group__trigger"
                onClick={() => setIsOpen((open) => !open)}
                aria-expanded={isOpen}
            >
                <span
                    className={`checkbox-group__icon${icon ? " checkbox-group__icon--svg" : ""}`}
                    aria-hidden="true"
                >
                    {icon && (
                        <FilterIcon
                            path={icon}
                            className="checkbox-group__icon-svg"
                        />
                    )}
                </span>

                <span className="checkbox-group__title">
                    {title}
                </span>

                {selectedCount > 0 && (
                    <span className="checkbox-group__count">
                        {selectedCount}
                    </span>
                )}

                <span
                    className="checkbox-group__arrow"
                    aria-hidden="true"
                />
            </button>

            {isOpen && (
                <div className="checkbox-group__content">
                    {renderOptions(options)}
                </div>
            )}
        </section>
    );
}

export default CheckboxGroup;