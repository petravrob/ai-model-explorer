import "./SearchField.css";

import type { ChangeEvent, FormEvent, KeyboardEvent } from "react";

import Button from "../Button/Button";

interface SearchFieldProps {
    value: string;
    placeholder?: string;
    ariaLabel?: string;
    className?: string;
    onChange: (event: ChangeEvent<HTMLInputElement>) => void;
    onSubmit: () => void;
    onClear?: () => void;
}

/** Vyhledávací pole, vstup s ikonou hledání a tlačítkem pro vymazání. */
function SearchField({
    value,
    placeholder = "Hledat…",
    ariaLabel = "Hledat",
    className,
    onChange,
    onSubmit,
    onClear,
}: SearchFieldProps) {

    const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {

        event.preventDefault();
        onSubmit();
    };

    const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>): void => {

        // Escape smaže hledání stejně jako tlačítko křížku (chování sjednocené napříč prohlížeči)
        if (event.key === "Escape" && value && onClear) {
            event.preventDefault();
            onClear();
        }
    };

    return (
        <form
            className={className ? `search-field ${className}` : "search-field"}
            role="search"
            onSubmit={handleSubmit}
        >
            <Button
                type="submit"
                variant="icon"
                className="search-field__submit"
                aria-label="Vyhledat"
            >
                <svg
                    className="search-field__icon"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                >
                    <circle cx="11" cy="11" r="7" />
                    <line x1="21" y1="21" x2="16.5" y2="16.5" />
                </svg>
            </Button>

            <input
                className="search-field__input"
                type="search"
                value={value}
                placeholder={placeholder}
                aria-label={ariaLabel}
                autoComplete="off"
                onChange={onChange}
                onKeyDown={handleKeyDown}
            />

            {value && onClear && (
                <Button
                    type="button"
                    variant="icon"
                    className="search-field__clear"
                    aria-label="Vymazat hledání"
                    onClick={onClear}
                >
                    ×
                </Button>
            )}
        </form>
    );
}

export default SearchField;