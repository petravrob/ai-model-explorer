import "./CheckboxGroupOptions.css";

import Checkbox from "../Checkbox/Checkbox";
import Icon from "../Icon/Icon";
import type { CheckboxGroupDisplayOption } from "../checkboxGroupTypes";

interface CheckboxGroupOptionsProps {
    options: readonly CheckboxGroupDisplayOption[];
    selected: string[];
    onToggle: (value: string) => void;
}

/**
 * Hodnoty kategorie filtru ve dvou sloupcích. Podkategorie se roztahuje přes oba
 * sloupce a má odsazené hodnoty, takže se v ní dá snadno projít nabídka.
 */
function CheckboxGroupOptions({ options, selected, onToggle }: CheckboxGroupOptionsProps) {
    return (
        <ul className="checkbox-group__options">
            {options.map((option) => {
                // Podkategorie má vlastní nabídku hodnot a roztahuje se přes oba sloupce
                if (option.children) {
                    return (
                        <li key={option.value} className="checkbox-group__group">
                            <span className="checkbox-group__group-label">
                                {option.icon && (
                                    <Icon
                                        path={option.icon}
                                        className="checkbox-group__group-icon"
                                    />
                                )}

                                {option.label}

                                {option.hiddenCount > 0 && (
                                    <span className="checkbox-group__group-more">
                                        +{option.hiddenCount}
                                    </span>
                                )}
                            </span>

                            <CheckboxGroupOptions
                                options={option.children}
                                selected={selected}
                                onToggle={onToggle}
                            />
                        </li>
                    );
                }

                return (
                    <li key={option.value}>
                        <span className="checkbox-group__option">
                            <Checkbox
                                label={option.label}
                                checked={selected.includes(option.value)}
                                onChange={() => onToggle(option.value)}
                            />
                        </span>
                    </li>
                );
            })}
        </ul>
    );
}

export default CheckboxGroupOptions;
