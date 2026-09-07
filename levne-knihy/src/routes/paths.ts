/**
 * Centrální definice všech rout aplikace.
 * Všechny komponenty a hooky odkazují na cesty pouze odsud.
 */

/** Vzory cest pro React Router. */
export const ROUTE_PATHS = {
    home: "/",
    modelDetail: "/model/:modelId",
    login: "/prihlasit-se",
    signUp: "/registrovat-se",
    user: "/uzivatel",
    notFound: "*",
} as const;

/** Název URL parametru s hledaným výrazem (např. „/?q=gpt“). */
export const SEARCH_QUERY_PARAM = "q";

/** Sestaví URL detailu konkrétního modelu. */
export const modelDetailUrl = (modelId: string): string =>
    `/model/${modelId}`;

/** Sestaví URL domovské stránky s volitelným hledaným výrazem. */
export const homeSearchUrl = (query?: string): string => {

    const trimmed = query?.trim() ?? "";

    return trimmed
        ? `${ROUTE_PATHS.home}?${SEARCH_QUERY_PARAM}=${encodeURIComponent(trimmed)}`
        : ROUTE_PATHS.home;
};

/** Cesty, na kterých je vyhledávání modelů aktivní (výsledky se filtrují podle URL parametru). */
export const SEARCHABLE_PATHS: readonly string[] = [
    ROUTE_PATHS.home,
];

/** Určí, zda na dané cestě funguje vyhledávání modelů. */
export const isSearchablePath = (pathname: string): boolean =>
    SEARCHABLE_PATHS.includes(pathname);

/** Stav předávaný přes React Router při přesměrování na přihlášení. */
export interface AuthRedirectState {
    from?: {
        pathname?: string;
    };
}
