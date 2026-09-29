import "./Header.css";

import { useCallback, useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";

import { ROUTE_PATHS, isSearchablePath } from "@/routes/paths";
import {
    FILTER_ICON,
    Icon,
    LogoBadge,
    MAGNIFIER_ICON,
    SORT_ICON,
} from "@/ui";
import {
    MODEL_BROWSER_STATE_EVENT,
    requestModelBrowserFilterToggle,
    requestModelBrowserPanelsClose,
    requestModelBrowserSortToggle,
} from "@/features/models/modelBrowserBridge";
import type { ModelBrowserBridgeState } from "@/features/models/modelBrowserBridge";

import SearchBar from "./SearchBar";

/** Horní lišta aplikace: logo s názvem a vyhledávání modelů. */
function Header() {

    // Na menších šířkách je vyhledávání schované a rozbalí ho tlačítko s lupou
    const [isSearchOpen, setIsSearchOpen] = useState(false);

    // Rozbalení vyhledávání je oddělené kvůli klávesové zkratce v poli hledání.
    // Filtry, řazení a vyhledávání se navzájem vylučují - otevřením hledání se panely zavřou.
    const openSearch = useCallback(() => {
        setIsSearchOpen(true);
        requestModelBrowserPanelsClose();
    }, []);

    const toggleSearch = useCallback(() => {
        if (isSearchOpen) {
            setIsSearchOpen(false);
            return;
        }

        openSearch();
    }, [isSearchOpen, openSearch]);

    const location = useLocation();

    // Ikony filtru a řazení se ukazují jen na domovské stránce s výpisem modelů
    const isModelBrowserPage = isSearchablePath(location.pathname);

    // Stav z ModelBrowseru: rozbalené/aktivní filtry a otevřené řazení (jen telefon)
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [isFilterActive, setIsFilterActive] = useState(false);
    const [isSortOpen, setIsSortOpen] = useState(false);

    useEffect(() => {
        const handleState = (event: Event): void => {
            const state = (event as CustomEvent<ModelBrowserBridgeState>).detail;

            setIsFilterOpen(state.isFilterOpen);
            setIsFilterActive(state.isFilterActive);
            setIsSortOpen(state.isSortOpen);

            // Otevřené filtry nebo řazení vyhledávání zavřou (na telefonu zabírají celou stránku)
            if (state.isFilterOpen || state.isSortOpen) {
                setIsSearchOpen(false);
            }
        };

        window.addEventListener(MODEL_BROWSER_STATE_EVENT, handleState);

        return () => window.removeEventListener(MODEL_BROWSER_STATE_EVENT, handleState);
    }, []);

    // Po odchodu z výpisu se ikony schovají a jejich stav vynuluje
    useEffect(() => {
        if (!isModelBrowserPage) {
            setIsFilterOpen(false);
            setIsSortOpen(false);
        }
    }, [isModelBrowserPage]);

    // Na telefonu se rozbalené vyhledávání při scrollu dolů schová
    // Zpátky se samo neotevírá - jinak by při scrollu nahoru vyskakovala klávesnice.
    useEffect(() => {
        if (!isSearchOpen) return;

        const mediaQuery = window.matchMedia("(max-width: 900px)");
        let lastY = window.scrollY;
        let ticking = false;

        const handleScroll = (): void => {
            const currentY = window.scrollY;
            ticking = false;

            // Drobné pohyby se ignorují, aby se vyhledávání neschovalo omylem
            if (Math.abs(currentY - lastY) < 8) return;

            // Schová se až kousek od začátku stránky, ne hned při prvním posunu
            if (mediaQuery.matches && currentY > lastY && currentY > 40) {
                setIsSearchOpen(false);
            }

            lastY = currentY;
        };

        const handleScrollThrottled = (): void => {
            if (ticking) return;
            ticking = true;
            window.requestAnimationFrame(handleScroll);
        };

        window.addEventListener("scroll", handleScrollThrottled, { passive: true });

        return () => window.removeEventListener("scroll", handleScrollThrottled);
    }, [isSearchOpen]);

    return (
        <header className="header">
            <div className="header__container">

                <NavLink to={ROUTE_PATHS.home} className="header__brand">

                    <LogoBadge />

                    <span className="header__brand-text">
                        <span className="header__title">AI Modely</span>

                        <span className="header__subtitle">
                            Prohlížení AI modelů z Hugging Face
                        </span>
                    </span>
                </NavLink>

                {/* Na telefonu jsou v liště i ikony filtru a řazení (jen nad výpisem modelů) */}
                <div className="header__actions">
                    {isModelBrowserPage && (
                        <div className="header__quick-actions">
                            <button
                                type="button"
                                className={`header__icon-button${isFilterOpen ? " header__icon-button--open" : ""}${isFilterActive ? " header__icon-button--active" : ""}`}
                                aria-label={isFilterOpen ? "Skrýt filtry" : "Zobrazit filtry"}
                                aria-expanded={isFilterOpen}
                                aria-controls="model-filter-categories"
                                onClick={requestModelBrowserFilterToggle}
                            >
                                <Icon path={FILTER_ICON} className="header__icon-button-icon" />
                                {isFilterActive && (
                                    <span className="header__icon-button-dot" aria-hidden="true" />
                                )}
                            </button>

                            <button
                                type="button"
                                className={`header__icon-button${isSortOpen ? " header__icon-button--open" : ""}`}
                                aria-label={isSortOpen ? "Skrýt řazení" : "Zobrazit řazení"}
                                aria-expanded={isSortOpen}
                                onClick={requestModelBrowserSortToggle}
                            >
                                <Icon path={SORT_ICON} className="header__icon-button-icon" />
                            </button>
                        </div>
                    )}

                    {/* Tlačítko s lupou se zobrazuje jen tam, kde je vyhledávání schované */}
                    <button
                        type="button"
                        className="header__search-toggle"
                        aria-label="Vyhledávání"
                        aria-expanded={isSearchOpen}
                        aria-controls="header-search"
                        onClick={toggleSearch}
                    >
                        <Icon path={MAGNIFIER_ICON} className="header__search-toggle-icon" />
                    </button>
                </div>

                <div
                    id="header-search"
                    className={`header__main${isSearchOpen ? " header__main--open" : ""}`}
                >
                    <SearchBar
                        autoFocus={isSearchOpen}
                        onRequestOpen={openSearch}
                    />
                </div>
            </div>
        </header>
    );
}

export default Header;
