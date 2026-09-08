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
 * Vyhledávání modelů v hlavičce.
 * Na stránkách se seznamem modelů (domovská stránka) filtruje modely průběžně při psaní,
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
        const urlValue = searchParams.get(SEARCH_QUERY_PARAM) ?? "";

        // URL ukládá výraz bez okrajových mezer, takže když odpovídá právě
        // psanému textu, pole se nepřepíše, aby se při psaní nemažaly mezery
        setValue((current) =>
            urlValue.trim() === current.trim() ? current : urlValue
        );
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

        // Průběžné filtrování pouze na stránkách se seznamem modelů
        if (isSearchablePage) {
            applySearch(event.target.value);
        }
    };

    const handleClear = (): void => {

        setValue("");

        // Na stránkách se seznamem modelů se vymaže i hledaný výraz v URL,
        // jinde jen zůstane prázdné pole bez přesměrování na domovskou stránku
        if (isSearchablePage) {
            applySearch("");
        }
    };

    return (
        <SearchField
            className="header__search"
            value={value}
            placeholder="Hledat modely…"
            ariaLabel="Hledat modely"
            onChange={handleChange}
            onSubmit={() => applySearch(value)}
            onClear={handleClear}
        />
    );
}

export default SearchBar;