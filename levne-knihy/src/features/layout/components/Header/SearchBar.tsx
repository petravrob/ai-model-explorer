import { useEffect, useRef, useState } from "react";
import type { ChangeEvent } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";

import {
    SEARCH_QUERY_PARAM,
    homeSearchUrl,
    isSearchablePath,
} from "@/routes/paths";
import { SearchField } from "@/ui";

/** Běží aplikace na macOS, kde mají klávesové zkratky vlastní symbol */
const IS_MAC = navigator.userAgent.includes("Mac");

/** Je stisknutá zkratka pro přesun kurzoru do hledání (na macOS ⌘K, na Windows a Linuxu Ctrl+K) */
const isSearchShortcut = (event: KeyboardEvent): boolean =>
    (IS_MAC ? event.metaKey : event.ctrlKey) && event.key.toLowerCase() === "k";

/**
 * Vyhledávání modelů v hlavičce.
 */
function SearchBar() {
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
    const location = useLocation();

    const urlQuery = searchParams.get(SEARCH_QUERY_PARAM) ?? "";

    const [value, setValue] = useState<string>(urlQuery);

    // Odkaz na pole hledání, aby do něj klávesová zkratka přesunula kurzor
    const inputRef = useRef<HTMLInputElement>(null);

    // Synchronizace pole s URL (např. po přechodu na jinou stránku se vyprázdní)
    useEffect(() => {
        const urlValue = searchParams.get(SEARCH_QUERY_PARAM) ?? "";

        setValue((current) =>
            urlValue.trim() === current.trim() ? current : urlValue
        );
    }, [searchParams, location.pathname]);

    // Klávesová zkratka přesune kurzor do hledání (na macOS ⌘K, na Windows a Linuxu Ctrl+K)
    useEffect(() => {
        const handleShortcut = (event: KeyboardEvent): void => {

            if (!isSearchShortcut(event)) {
                return;
            }

            event.preventDefault();
            inputRef.current?.focus();
        };

        document.addEventListener("keydown", handleShortcut);

        return () => document.removeEventListener("keydown", handleShortcut);
    }, []);

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
            inputRef={inputRef}
            value={value}
            placeholder="Hledat modely, autory nebo tagy…"
            ariaLabel="Hledat modely"
            onChange={handleChange}
            onSubmit={() => applySearch(value)}
            onClear={handleClear}
        />
    );
}

export default SearchBar;
