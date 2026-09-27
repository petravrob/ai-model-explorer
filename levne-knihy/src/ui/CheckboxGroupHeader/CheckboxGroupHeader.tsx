import "./CheckboxGroupHeader.css";

import Icon from "../Icon/Icon";
import { formatSelectedCount } from "../checkboxGroupOptionUtils";

interface CheckboxGroupHeaderProps {
    title: string;
    // Ikona u názvu kategorie - SVG cesta (viewBox 24×24)
    icon?: string;
    // Přepínač, zda je nabídka hodnot rozbalená
    isOpen: boolean;
    // Kolik hodnot v kategorii je zvolených
    selectedCount: number;
    onToggle: () => void;
}

/** Hlavička kategorie filtrů, která se dá rozbalit a skrýt. */
function CheckboxGroupHeader({
    title,
    icon,
    isOpen,
    selectedCount,
    onToggle,
}: CheckboxGroupHeaderProps) {
    return (
        <button
            type="button"
            className="checkbox-group__header"
            aria-expanded={isOpen}
            onClick={onToggle}
        >
            {icon && (
                <span className="checkbox-group__icon" aria-hidden="true">
                    <Icon
                        path={icon}
                        className="checkbox-group__icon-svg"
                    />
                </span>
            )}

            <span className="checkbox-group__title">
                {title}
            </span>

            {selectedCount > 0 && (
                <span className="checkbox-group__count">
                    {formatSelectedCount(selectedCount)}
                </span>
            )}

            <span
                className={`checkbox-group__chevron${
                    isOpen ? " checkbox-group__chevron--open" : ""
                }`}
                aria-hidden="true"
            />
        </button>
    );
}

export default CheckboxGroupHeader;
