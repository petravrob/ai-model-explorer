import "./ModelSort.css";

import type { ChangeEvent } from "react";

import { MODEL_SORTS_CONFIG, type ModelSortKey } from "../../modelSortsConfig";

interface ModelSortProps {
    value: ModelSortKey;
    onChange: (value: ModelSortKey) => void;
}

/** Výběr řazení modelů nad výpisem. */
function ModelSort({ value, onChange }: ModelSortProps) {

    // Hodnota z výběru se převede zpět na možnost z konfigurace
    const handleChange = (event: ChangeEvent<HTMLSelectElement>): void => {

        const sortOption = MODEL_SORTS_CONFIG.find(
            (entry) => entry.value === event.target.value
        );

        if (sortOption) {
            onChange(sortOption.value);
        }
    };

    return (
        <div className="model-sort">
            <label
                className="model-sort__label"
                htmlFor="model-sort-select"
            >
                Seřadit:
            </label>

            <select
                id="model-sort-select"
                className="model-sort__select"
                value={value}
                onChange={handleChange}
            >
                {MODEL_SORTS_CONFIG.map((sortOption) => (
                    <option key={sortOption.value} value={sortOption.value}>
                        {sortOption.label}
                    </option>
                ))}
            </select>
        </div>
    );
}

export default ModelSort;
