import "./ModelSort.css";

import { useEffect, useRef, useState } from "react";

import { MODEL_SORTS_CONFIG, type ModelSortKey } from "../../modelSortsConfig";

interface ModelSortProps {
    value: ModelSortKey;
    onChange: (value: ModelSortKey) => void;
}

/** Výběr řazení modelů nad výpisem. */
function ModelSort({ value, onChange }: ModelSortProps) {

    const [isOpen, setIsOpen] = useState(false);
    const controlRef = useRef<HTMLDivElement>(null);

    const selectedSort = MODEL_SORTS_CONFIG.find(
        (sortOption) => sortOption.value === value
    ) ?? MODEL_SORTS_CONFIG[0];

    useEffect(() => {
        const handlePointerDown = (event: PointerEvent): void => {
            if (!controlRef.current?.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        const handleKeyDown = (event: KeyboardEvent): void => {
            if (event.key === "Escape") {
                setIsOpen(false);
            }
        };

        document.addEventListener("pointerdown", handlePointerDown);
        document.addEventListener("keydown", handleKeyDown);

        return () => {
            document.removeEventListener("pointerdown", handlePointerDown);
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, []);

    const handleOptionClick = (sortKey: ModelSortKey): void => {
        onChange(sortKey);
        setIsOpen(false);
    };

    return (
        <div className="model-sort">
            <label
                className="model-sort__label"
                htmlFor="model-sort-select"
            >
                Seřadit:
            </label>

            <div
                ref={controlRef}
                className={`model-sort__control${isOpen ? " model-sort__control--open" : ""}`}
            >
                <button
                    id="model-sort-select"
                    type="button"
                    className="model-sort__select"
                    aria-haspopup="listbox"
                    aria-expanded={isOpen}
                    onClick={() => setIsOpen((open) => !open)}
                >
                    <span>{selectedSort.label}</span>
                    <span className="model-sort__chevron" aria-hidden="true" />
                </button>

                {isOpen && (
                    <div
                        className="model-sort__menu"
                        role="listbox"
                        aria-label="Možnosti řazení"
                    >
                        {MODEL_SORTS_CONFIG.map((sortOption) => (
                            <button
                                key={sortOption.value}
                                type="button"
                                role="option"
                                aria-selected={sortOption.value === value}
                                className={`model-sort__option${
                                    sortOption.value === value
                                        ? " model-sort__option--active"
                                        : ""
                                }`}
                                onClick={() => handleOptionClick(sortOption.value)}
                            >
                                <span>{sortOption.label}</span>
                                {sortOption.value === value && (
                                    <span className="model-sort__check" aria-hidden="true">
                                        ✓
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default ModelSort;
