/**
 * Pomocník pro vizuální zobrazení výsledků benchmarků.
 *
 * Pruh se kreslí jen tam, kde má číslo jasný význam: u výsledků, které se vyjadřují
 * v procentech nebo v rozsahu 0–1. U metrik, kde vyšší hodnota znamená horší výsledek
 * (chybovost, ztráta, latence) nebo u jiných stupnic se pruh nekreslí - číslo zůstává.
 */

import type { ModelBenchmark } from "../types";

// Metriky, u kterých vyšší číslo znamená horší výsledek
const LOWER_IS_BETTER = /(wer|cer|loss|perplexity|ppl|error|chyb|latency|ms\b|rtf|čas)/i;

/** Převede výsledek benchmarku na podíl 0–100, nebo vrátí null, když se nehodí. */
export const getBenchmarkPercent = (benchmark: ModelBenchmark): number | null => {
    const value = Number.parseFloat(String(benchmark.score ?? "").replace(",", ".").replace(/[^\d.]/g, ""));

    if (!Number.isFinite(value) || value <= 0) {
        return null;
    }

    if (LOWER_IS_BETTER.test(`${benchmark.name} ${benchmark.metric ?? ""}`)) {
        return null;
    }

    // Skóre v rozsahu 0–1 (např. accuracy 0,87) se převede na procenta
    const percent = value <= 1 ? value * 100 : value;

    // Delší pruh než celá stupnice by byl nesmysl, proto se takové hodnoty vynechají
    return percent <= 100 ? percent : null;
};
