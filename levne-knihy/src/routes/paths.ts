/**
 * Centrální definice všech rout aplikace.
 * Všechny komponenty a hooky odkazují cesty pouze odsud.
 */

/** Vzory cest pro React Router. */
export const ROUTE_PATHS = {
    home: "/",
    bookDetail: "/kniha/:bookId",
    login: "/prihlasit-se",
    signUp: "/registrovat-se",
    addAdvertisement: "/pridat-inzerat",
    myAdvertisements: "/moje-inzeraty",
    user: "/uzivatel",
    notFound: "*",
} as const;

/** Název URL parametru s hledaným výrazem (např. „/?q=tolkien“). */
export const SEARCH_QUERY_PARAM = "q";

/** Sestaví URL detailu konkrétní knihy. */
export const bookDetailUrl = (bookId: string): string =>
    `/kniha/${bookId}`;

/** Sestaví URL domovské stránky s volitelným hledaným výrazem. */
export const homeSearchUrl = (query?: string): string => {

    const trimmed = query?.trim() ?? "";

    return trimmed
        ? `${ROUTE_PATHS.home}?${SEARCH_QUERY_PARAM}=${encodeURIComponent(trimmed)}`
        : ROUTE_PATHS.home;
};

/** Cesty, na kterých je vyhledávání knih aktivní (výsledky se filtrují podle URL parametru). */
export const SEARCHABLE_PATHS: readonly string[] = [
    ROUTE_PATHS.home,
    ROUTE_PATHS.myAdvertisements,
];

/** Určí, zda na dané cestě funguje vyhledávání knih. */
export const isSearchablePath = (pathname: string): boolean =>
    SEARCHABLE_PATHS.includes(pathname);

/** Stav předávaný přes React Router při přesměrování na přihlášení. */
export interface AuthRedirectState {
    from?: {
        pathname?: string;
    };
}
