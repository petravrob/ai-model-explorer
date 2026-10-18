/**
 * Stránkování výpisu modelů.
 *
 * Jedna dávka se načte ze serveru a hned se zobrazí. Tlačítko "Načíst další modely"
 * vyžádá další dávku modelů
 */

/** Kolik modelů se načte jedním požadavkem na server. */
export const MODELS_PER_PAGE = 24;

/**
 * Největší počet modelů, který server vrátí v jedné odpovědi.
 * Musí odpovídat MAX_PAGE_SIZE v ai-modely-node/controllers/modelController.js.
 */
export const MODELS_MAX_PAGE_SIZE = 100;
