/**
 * Nastavení stránkování výpisu modelů.
 */

// Kolik modelů se vrací na jednu stránku výpisu (klient si o další řekne tlačítkem)
const DEFAULT_PAGE_SIZE = 24;

// Největší počet modelů v jedné odpovědi (stejná hodnota je MODELS_MAX_PAGE_SIZE v klientovi)
const MAX_PAGE_SIZE = 100;

// Kolikrát víc modelů se stáhne, když je zvolený jazyk (HF podle jazyka filtrovat neumí)
const LANGUAGE_FILTER_OVERFETCH = 4;

// HF povolí "skip" jen do 3000. položky, výš vrátí chybu (parametr je zastaralý)
const MAX_PAGE_OFFSET = 3000;

module.exports = {
    DEFAULT_PAGE_SIZE,
    MAX_PAGE_SIZE,
    LANGUAGE_FILTER_OVERFETCH,
    MAX_PAGE_OFFSET,
};
