/**
 * Obstarává zobrazení filtrů nebo řazení při prohlížení na telefonu.
 * Lehký most mezi prohlížečem modelů a hlavičkou.

 */

/** Stav, který ModelBrowser hlásí hlavičce. */
export interface ModelBrowserBridgeState {
    // Jsou rozbalené filtry (panel pod lištou)
    isFilterOpen: boolean;
    // Je zvolený aspoň jeden filtr
    isFilterActive: boolean;
    // Je otevřená nabídka řazení
    isSortOpen: boolean;
}

/** Událost se stavem pro hlavičku. */
export const MODEL_BROWSER_STATE_EVENT = "model-browser:state";
/** Hlavička žádá přepnutí filtrů. */
export const MODEL_BROWSER_TOGGLE_FILTERS_EVENT = "model-browser:toggle-filters";
/** Hlavička žádá přepnutí nabídky řazení. */
export const MODEL_BROWSER_TOGGLE_SORT_EVENT = "model-browser:toggle-sort";

/** ModelBrowser ohlásí svůj stav hlavičce. */
export function publishModelBrowserState(state: ModelBrowserBridgeState): void {
    window.dispatchEvent(
        new CustomEvent<ModelBrowserBridgeState>(MODEL_BROWSER_STATE_EVENT, {
            detail: state,
        })
    );
}

/** Hlavička požádá o přepnutí filtrů. */
export function requestModelBrowserFilterToggle(): void {
    window.dispatchEvent(new CustomEvent(MODEL_BROWSER_TOGGLE_FILTERS_EVENT));
}

/** Hlavička požádá o přepnutí nabídky řazení. */
export function requestModelBrowserSortToggle(): void {
    window.dispatchEvent(new CustomEvent(MODEL_BROWSER_TOGGLE_SORT_EVENT));
}
