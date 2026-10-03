/**
 * Obstarává zobrazení filtrů nebo řazení při prohlížení na telefonu.
 */
export interface ModelBrowserBridgeState {
    // Jsou rozbalené filtry (panel pod lištou)
    isFilterOpen: boolean;
    // Je zvolený aspoň jeden filtr
    isFilterActive: boolean;
    // Kolik hodnot filtrů je zvolených (počet se vypisuje na ikoně filtrů)
    activeFilterCount: number;
    // Je otevřená nabídka řazení
    isSortOpen: boolean;
}

/** Událost se stavem pro hlavičku. */
export const MODEL_BROWSER_STATE_EVENT = "model-browser:state";
/** Přepnutí filtrů. */
export const MODEL_BROWSER_TOGGLE_FILTERS_EVENT = "model-browser:toggle-filters";
/** Přepnutí nabídky řazení. */
export const MODEL_BROWSER_TOGGLE_SORT_EVENT = "model-browser:toggle-sort";
/** Zavření filtrů i řazení (otevřelo se vyhledávání). */
export const MODEL_BROWSER_CLOSE_PANELS_EVENT = "model-browser:close-panels";

/** ModelBrowser ohlásí svůj stav hlavičce. */
export function publishModelBrowserState(state: ModelBrowserBridgeState): void {
    window.dispatchEvent(
        new CustomEvent<ModelBrowserBridgeState>(MODEL_BROWSER_STATE_EVENT, {
            detail: state,
        })
    );
}

/** Přepnutí filtrů. */
export function requestModelBrowserFilterToggle(): void {
    window.dispatchEvent(new CustomEvent(MODEL_BROWSER_TOGGLE_FILTERS_EVENT));
}

/** Přepnutí nabídky řazení. */
export function requestModelBrowserSortToggle(): void {
    window.dispatchEvent(new CustomEvent(MODEL_BROWSER_TOGGLE_SORT_EVENT));
}

/** Zavření filtrů i řazení (panely se navzájem vylučují s vyhledáváním). */
export function requestModelBrowserPanelsClose(): void {
    window.dispatchEvent(new CustomEvent(MODEL_BROWSER_CLOSE_PANELS_EVENT));
}
