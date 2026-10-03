import type { CheckboxGroupDisplayOption, CheckboxGroupOption } from "./checkboxGroupTypes";

/**
 * Počet hodnot podkategorie, které se ukážou ve zkrácené nabídce (mají se ukázat nejpoužívanější).
 */
const VISIBLE_CHILD_VALUE_LIMIT = 6;

/** Počet hodnot filtru, které jsou zvoleny. */
export function countSelected(options: readonly CheckboxGroupOption[], selected: string[]): number {
    return options.reduce(
        (count, option) =>
            count +
            (selected.includes(option.value) ? 1 : 0) +
            (option.children ? countSelected(option.children, selected) : 0),
        0
    );
}

/** Popisek počtu zvolených hodnot se správným českým tvarem (např. "aktivní" nebo "7 aktivních"). */
export function formatSelectedCount(count: number): string {
    return count >= 5 ? `${count} aktivních` : `${count} aktivní`;
}

/** Počet hodnot filtru. */
function countValues(option: CheckboxGroupOption): number {
    const children = option.children ?? [];

    if (children.length === 0) {
        return 1;
    }

    return children.reduce((count, child) => count + countValues(child), 0);
}

/** Zda je hodnota filtru kategorie zvolená. */
function hasSelectedOption(option: CheckboxGroupOption, selected: string[]): boolean {
    const hasSelectedChild = (option.children ?? []).some((child) =>
        hasSelectedOption(child, selected)
    );

    return selected.includes(option.value) || hasSelectedChild;
}

/**
 * Zkrátí nabídku na daný počet hodnot, aby kategorie nezabírala celou výšku panelu.
 * Vypíše "Načíst další" a počet pro to, co se nevešlo.
 */
export function limitOptions(
    options: readonly CheckboxGroupOption[],
    selected: string[],
    visibleValues: number
): { items: CheckboxGroupDisplayOption[]; hiddenCount: number } {
    const items: CheckboxGroupDisplayOption[] = [];
    let valueCount = 0;
    let hiddenCount = 0;

    for (const option of options) {
        // Nabídka podkategorie se zkracuje také, aby kategorii nezabrala celou
        const children = limitOptions(option.children ?? [], selected, VISIBLE_CHILD_VALUE_LIMIT);

        // Popisek podkategorie zabere celý řádek nabídky
        const cells = children.items.length > 0 ? 2 + children.items.length : 1;

        // První hodnota kategorie se zobrazí vždy, aby zkrácená nabídka nebyla prázdná
        const fits = items.length === 0 || valueCount + cells <= visibleValues;

        if (!fits && !hasSelectedOption(option, selected)) {
            hiddenCount += countValues(option);
            continue;
        }

        items.push({
            value: option.value,
            label: option.label,
            icon: option.icon,
            children: children.items.length > 0 ? children.items : undefined,
            hiddenCount: children.hiddenCount,
        });

        valueCount += cells;
        hiddenCount += children.hiddenCount;
    }

    return { items, hiddenCount };
}

/** Připraví celou nabídku k zobrazení bez zkracování, používá se po rozbalení kategorie. */
export function toDisplayOptions(options: readonly CheckboxGroupOption[]): CheckboxGroupDisplayOption[] {
    return options.map((option) => ({
        value: option.value,
        label: option.label,
        icon: option.icon,
        children: option.children ? toDisplayOptions(option.children) : undefined,
        hiddenCount: 0,
    }));
}
