import "./Checkbox.css";

import type { ChangeEvent } from "react";

interface CheckboxProps {
    label: string;
    checked: boolean;
    onChange: (checked: boolean) => void;
}

/** Zaškrtávací pole s popiskem. */
function Checkbox({ label, checked, onChange }: CheckboxProps) {

    const handleChange = (event: ChangeEvent<HTMLInputElement>): void =>
        onChange(event.target.checked);

    return (
        <label className="checkbox">
            <input
                className="checkbox__input"
                type="checkbox"
                checked={checked}
                onChange={handleChange}
            />

            <span className="checkbox__label">{label}</span>
        </label>
    );
}

export default Checkbox;