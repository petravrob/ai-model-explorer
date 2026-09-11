import "./CheckboxGroup.css";

import Checkbox from "../Checkbox/Checkbox";

/** Jedna hodnota v nabídce skupiny zaškrtávacích polí. */
export interface CheckboxGroupOption {
    value: string;
    label: string;
}

interface CheckboxGroupProps {
    title: string;
    options: readonly CheckboxGroupOption[];
    selected: string[];
    onToggle: (value: string) => void;
}

/** Skupina zaškrtávacích polí s viditelným názvem, umožňuje vybrat více hodnot. */
function CheckboxGroup({ title, options, selected, onToggle }: CheckboxGroupProps) {
    return (
        <fieldset className="checkbox-group">
            <legend className="checkbox-group__title">{title}</legend>

            <ul className="checkbox-group__options">
                {options.map((option) => (
                    <li key={option.value}>
                        <Checkbox
                            label={option.label}
                            checked={selected.includes(option.value)}
                            onChange={() => onToggle(option.value)}
                        />
                    </li>
                ))}
            </ul>
        </fieldset>
    );
}

export default CheckboxGroup;

