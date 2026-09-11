import "./CheckboxGroup.css";

import Checkbox from "../Checkbox/Checkbox";

/** Jedna hodnota v nabídce skupiny zaškrtávacích polí. */
export interface CheckboxGroupOption {
    value: string;
    label: string;
    children?: readonly CheckboxGroupOption[];
}

interface CheckboxGroupProps {
    title: string;
    options: readonly CheckboxGroupOption[];
    selected: string[];
    onToggle: (value: string) => void;
}

/** Skupina zaškrtávacích polí s viditelným názvem, umožňuje vybrat více hodnot. */
function CheckboxGroup({ title, options, selected, onToggle }: CheckboxGroupProps) {
    const renderOptions = (items: readonly CheckboxGroupOption[]) => (
        <ul className="checkbox-group__options">
            {items.map((option) => {
                const hasChildren = Boolean(option.children?.length);

                return (
                    <li key={option.value}>
                        {hasChildren ? (
                            <div className="checkbox-group__group">
                                <span className="checkbox-group__group-label">{option.label}</span>
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
        <fieldset className="checkbox-group">
            <legend className="checkbox-group__title">{title}</legend>
            {renderOptions(options)}
        </fieldset>
    );
}

export default CheckboxGroup;

