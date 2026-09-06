import { useEffect, useState } from "react";
import type { ChangeEvent } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";

import {
    SEARCH_QUERY_PARAM,
    homeSearchUrl,
    isSearchablePath,
} from "@/routes/paths";
import { SearchField } from "@/ui";

/**
 * Vyhledávání knih v hlavičce.
 * Na stránkách se seznamem knih (domovská stránka, moje inzeráty) filtruje knihy průběžně při psaní,
 * na ostatních stránkách po odeslání přesune na domovskou stránku s výsledky.
 */
function SearchBar() {
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
    const location = useLocation();

    const urlQuery = searchParams.get(SEARCH_QUERY_PARAM) ?? "";

    const [value, setValue] = useState<string>(urlQuery);

    // Synchronizace pole s URL (např. po přechodu na jinou stránku se vyprázdní)
    useEffect(() => {
        setValue(searchParams.get(SEARCH_QUERY_PARAM) ?? "");
    }, [searchParams, location.pathname]);

    const isSearchablePage =
        isSearchablePath(location.pathname);

    /** Aktualizuje hledaný výraz v URL. */
    const applySearch = (rawQuery: string): void => {

        const query = rawQuery.trim();

        if (isSearchablePage) {
            const params = new URLSearchParams(searchParams);

            if (query) {
                params.set(SEARCH_QUERY_PARAM, query);
            } else {
                params.delete(SEARCH_QUERY_PARAM);
            }

            // „replace“ zamezí zaplavání historie při psaní
            setSearchParams(params, { replace: true });

        } else {
            navigate(homeSearchUrl(query));
        }
    };

    const handleChange = (
        event: ChangeEvent<HTMLInputElement>
    ): void => {

        setValue(event.target.value);

        // Průběžné filtrování pouze na stránkách se seznamem knih
        if (isSearchablePage) {
            applySearch(event.target.value);
        }
    };

    const handleClear = (): void => {

        setValue("");
        applySearch("");
    };

    return (
        <SearchField
            className="header__search"
            value={value}
            placeholder="Hledat knihy…"
            ariaLabel="Hledat knihy"
            onChange={handleChange}
            onSubmit={() => applySearch(value)}
            onClear={handleClear}
        />
    );
}

export default SearchBar;