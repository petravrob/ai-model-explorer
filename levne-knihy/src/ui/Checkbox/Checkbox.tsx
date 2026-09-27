import "./Checkbox.css";

interface CheckboxProps {
    label: string;
    checked: boolean;
    onChange: () => void;
}

/** Pole pro výběr s popiskem. */
function Checkbox({ label, checked, onChange }: CheckboxProps) {

    return (
        <label className="checkbox">
            <input
                className="checkbox__input"
                type="checkbox"
                checked={checked}
                onChange={onChange}
            />

            <span className="checkbox__label" title={label}>{label}</span>
        </label>
    );
}

export default Checkbox;
