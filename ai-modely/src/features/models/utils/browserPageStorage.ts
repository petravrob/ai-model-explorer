// Ukládání stavu stránky prohlížeče modelů (pozice scrollu a počet zobrazených).
// Při kliknutí na logo se resetuje.

const STORAGE_PREFIX = "ai-modely:prohlizeni:";

interface StoredPageState {
    scrollY?: number;
    visibleCount?: number;
}

const readPageState = (locationKey: string): StoredPageState => {
    try {
        const raw = window.sessionStorage.getItem(`${STORAGE_PREFIX}${locationKey}`);

        return raw ? (JSON.parse(raw) as StoredPageState) : {};
    } catch {
        return {};
    }
};

const writePageState = (
    locationKey: string,
    patch: Partial<StoredPageState>
): void => {
    try {
        const nextState = { ...readPageState(locationKey), ...patch };

        window.sessionStorage.setItem(
            `${STORAGE_PREFIX}${locationKey}`,
            JSON.stringify(nextState)
        );
    } catch {
        // Plné nebo nedostupné úložiště - stav se prostě neuloží
    }
};

/** Uložená pozice scrollu stránky (0, když se žádná neuložila). */
export const readScrollPosition = (locationKey: string): number =>
    readPageState(locationKey).scrollY ?? 0;

/** Uloží pozici scrollu stránky. */
export const saveScrollPosition = (
    locationKey: string,
    scrollY: number
): void => writePageState(locationKey, { scrollY });

/** Uložený počet zobrazených modelů. */
export const readVisibleCount = (
    locationKey: string,
    fallback: number
): number => readPageState(locationKey).visibleCount ?? fallback;

/** Uloží počet zobrazených modelů. */
export const saveVisibleCount = (
    locationKey: string,
    visibleCount: number
): void => writePageState(locationKey, { visibleCount });
