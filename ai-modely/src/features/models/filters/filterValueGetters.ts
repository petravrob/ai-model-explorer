import type { AIModel } from "../types";

/**
 * Vytvoří čtení hodnot kategorie z vlastnosti modelu.
 * Vlastnost může obsahovat jeden řetězec, pole řetězců, nebo být undefined/null.
 */
export const fromModelField =
    (field: keyof AIModel) =>
    (model: AIModel): string[] => {
        const value = model[field];

        if (typeof value === "string") {
            return value ? [value] : [];
        }

        if (Array.isArray(value)) {
            return value.filter(
                (item): item is string =>
                    typeof item === "string" && item.length > 0
            );
        }

        return [];
    };

/** Převede počet parametrů modelu na rozsah používaný filtrem. */
export const fromParameterCount = (model: AIModel): string[] => {
    const parameters = model.parameters;

    if (typeof parameters !== "number" || parameters <= 0) {
        return [];
    }

    const billions = parameters / 1e9;

    if (billions < 1) {
        return ["0-1B"];
    }

    if (billions < 7) {
        return ["1-7B"];
    }

    if (billions < 13) {
        return ["7-13B"];
    }

    if (billions < 30) {
        return ["13-30B"];
    }

    if (billions < 70) {
        return ["30-70B"];
    }

    return ["70B+"];
};
