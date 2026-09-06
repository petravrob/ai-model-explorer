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

/** Sestaví URL detailu konkrétní knihy. */
export const bookDetailUrl = (bookId: string): string =>
    `/kniha/${bookId}`;

/** Stav předávaný přes React Router při přesměrování na přihlášení. */
export interface AuthRedirectState {
    from?: {
        pathname?: string;
    };
}
