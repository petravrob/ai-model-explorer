// api url
export const API_URL =
    import.meta.env.VITE_API_URL === "development"
        ? "http://localhost:5000"
        : "https://ai-modely-api.onrender.com";

// Verze aplikace odvozená při buildu z čísla větve (číslo pull requestu)
export const APP_VERSION = __APP_VERSION__;

