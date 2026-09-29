import "./ModelBrowser.css";

import { useEffect, useState } from "react";

import useModelBrowser from "../../hooks/useModelBrowser";
import {
    MODEL_BROWSER_CLOSE_PANELS_EVENT,
    MODEL_BROWSER_TOGGLE_FILTERS_EVENT,
    MODEL_BROWSER_TOGGLE_SORT_EVENT,
    publishModelBrowserState,
} from "../../modelBrowserBridge";
import { DEFAULT_TAB, MODEL_TABS_CONFIG } from "../../modelTabsConfig";
import { Button, LogoLoader, PageContainer, PageMessage } from "@/ui";

import ModelFilterPanel from "../ModelFilterPanel/ModelFilterPanel";
import ModelList from "../ModelList/ModelList";
import ModelSort from "../ModelSort/ModelSort";
import ModelTabs from "../ModelTabs/ModelTabs";

/** Rozhraní pro zobrazení seznamu modelů. */
function ModelBrowser() {

    const {
        models,
        pendingDescriptionIds,
        hasMore,
        loadMore,
        searchQuery,
        isFuzzySearch,
        filters,
        isFilterActive,
        handleFilterChange,
        resetFilters,
        sort,
        setSort,
        tab,
        setTab,
        handleModelClick,

        loading,
        hasLoaded,
        error,
    } = useModelBrowser();

    // Na obrazovce počítače jsou filtry vidět pořád, na menších šířkách se rozbalují ikonou v hlavičce
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    // Na telefonu otevírá nabídku řazení ikona v hlavičce, proto její stav drží prohlížeč
    const [isSortOpen, setIsSortOpen] = useState(false);
    // Na telefonu se lišta se štítky při scrollu dolů schová a při scrollu nahoru zase ukáže
    const [isTagsHidden, setIsTagsHidden] = useState(false);

    // Stav pro ikony v hlavičce (jen na telefonu): rozbalené filtry / aktivní filtry / otevřené řazení
    useEffect(() => {
        if (hasLoaded) {
            publishModelBrowserState({ isFilterOpen, isFilterActive, isSortOpen });
        }
    }, [hasLoaded, isFilterOpen, isFilterActive, isSortOpen]);

    // Požadavky z hlavičky (ikony na telefonu) přepínají filtry a řazení tady u výpisu.
    // Filtry, řazení a vyhledávání se navzájem vylučují - otevřením jednoho se ostatní zavřou.
    useEffect(() => {
        const handleToggleFilters = (): void => {
            setIsSortOpen(false);
            setIsFilterOpen((open) => !open);
        };
        const handleToggleSort = (): void => {
            setIsFilterOpen(false);
            setIsSortOpen((open) => !open);
        };
        const handleClosePanels = (): void => {
            setIsFilterOpen(false);
            setIsSortOpen(false);
        };

        window.addEventListener(MODEL_BROWSER_TOGGLE_FILTERS_EVENT, handleToggleFilters);
        window.addEventListener(MODEL_BROWSER_TOGGLE_SORT_EVENT, handleToggleSort);
        window.addEventListener(MODEL_BROWSER_CLOSE_PANELS_EVENT, handleClosePanels);

        return () => {
            window.removeEventListener(MODEL_BROWSER_TOGGLE_FILTERS_EVENT, handleToggleFilters);
            window.removeEventListener(MODEL_BROWSER_TOGGLE_SORT_EVENT, handleToggleSort);
            window.removeEventListener(MODEL_BROWSER_CLOSE_PANELS_EVENT, handleClosePanels);
        };
    }, []);

    // Na telefonu jsou filtry a řazení samostatné stránky, proto se při jejich otevření
    // obsah posune nahoru - uživatel tak nezačíná na konci seznamu, který se právě schoval.
    useEffect(() => {
        if (!isFilterOpen && !isSortOpen) return;
        if (!window.matchMedia("(max-width: 900px)").matches) return;

        window.scrollTo({ top: 0, left: 0 });
    }, [isFilterOpen, isSortOpen]);

    // Na telefonu se lišta se štítky při scrollu dolů schová, při scrollu nahoru zase ukáže.
    // Otevřené filtry nebo řazení lištu řeší samy (viz ModelBrowser.css).
    useEffect(() => {
        const mediaQuery = window.matchMedia("(max-width: 900px)");
        let lastY = window.scrollY;
        let ticking = false;

        // Horní lišta na telefonu nemá pevnou výšku (menší název, rozbalené vyhledávání),
        // proto se její skutečná výška měří a lišta se umístí přesně pod ni.
        const header = document.querySelector(".header");
        const syncHeaderHeight = (): void => {
            const height = header?.getBoundingClientRect().height;
            if (height && height > 0) {
                document.documentElement.style.setProperty(
                    "--header-height-mobile",
                    `${Math.round(height)}px`,
                );
            }
        };
        syncHeaderHeight();

        let resizeObserver: ResizeObserver | null = null;
        if (typeof ResizeObserver !== "undefined" && header) {
            resizeObserver = new ResizeObserver(syncHeaderHeight);
            resizeObserver.observe(header);
        }

        const handleScroll = (): void => {
            const currentY = window.scrollY;
            // Drobné pohyby se ignorují, aby lišta nepřeblikávala
            if (Math.abs(currentY - lastY) < 8) {
                ticking = false;
                return;
            }
            // Úplně nahoře je lišta vždycky vidět
            if (currentY <= 8) {
                setIsTagsHidden(false);
            } else if (mediaQuery.matches && !isFilterOpen && !isSortOpen) {
                // Schová se až po odscrollování, při scrollu nahoru se ukáže
                if (currentY > lastY && currentY > 140) {
                    setIsTagsHidden(true);
                } else if (currentY < lastY) {
                    setIsTagsHidden(false);
                }
            }
            lastY = currentY;
            ticking = false;
        };

        const handleScrollThrottled = (): void => {
            if (!ticking) {
                ticking = true;
                window.requestAnimationFrame(handleScroll);
            }
        };

        window.addEventListener("scroll", handleScrollThrottled, { passive: true });

        return () => {
            window.removeEventListener("scroll", handleScrollThrottled);
            resizeObserver?.disconnect();
            document.documentElement.style.removeProperty("--header-height-mobile");
        };
    }, [isFilterOpen, isSortOpen]);

    // Když prohlížeč zmizí - přepnutí na detail nějakého modelu
    useEffect(() => {
        return () => {
            publishModelBrowserState({ isFilterOpen: false, isFilterActive: false, isSortOpen: false });
        };
    }, []);

    // Celostránková zpráva se ukáže jen před prvním načtením (případně při jeho neúspěchu).
    // Při obnově kvůli změně filtrů zůstane rozvržení i stávající výpis modelů na stránce.
    if (!hasLoaded) {
        return (
            <PageContainer>
                <div className="model-browser">
                    {error ? (
                        <PageMessage>{error}</PageMessage>
                    ) : (
                        <div className="model-browser__initial-loading">
                            <LogoLoader label="Načítání modelů" />
                        </div>
                    )}
                </div>
            </PageContainer>
        );
    }

    // Zvolený štítek (jiný než výchozí) výpis zúží, jeho význam se vypíše nad výsledky
    const isTabActive = tab !== DEFAULT_TAB;

    // Na telefonu jsou filtry a řazení samostatné stránky, podle toho se upraví rozvržení
    const layoutClassName = `model-browser-layout${
        isFilterOpen ? " model-browser-layout--filter-open" : ""
    }${isSortOpen ? " model-browser-layout--sort-open" : ""}`;

    const activeTab = MODEL_TABS_CONFIG.find(
        (tabOption) => tabOption.value === tab
    ) ?? MODEL_TABS_CONFIG[0];

    // Zpráva pro prázdný výpis, rozliší hledání, filtry, štítek a prázdnou databázi
    const emptyMessage = searchQuery
        ? `Pro hledaný výraz „${searchQuery}“ nebyly nalezeny žádné modely.`
        : isFilterActive
            ? "Podle zvolených filtrů nebyly nalezeny žádné modely."
            : isTabActive
                ? `Pro štítek „${activeTab.label}“ nebyly nalezeny žádné modely.`
                : "Nebyly nalezeny žádné modely.";

    return (
        <div className={layoutClassName}>

            <div
                className={`model-browser-layout__sidebar${
                    isFilterOpen ? " model-browser-layout__sidebar--open" : ""
                }`}
            >
                <ModelFilterPanel
                    filters={filters}
                    isFilterActive={isFilterActive}
                    onFilterChange={handleFilterChange}
                    onReset={resetFilters}
                />
            </div>

            <PageContainer>
                <div className="model-browser" aria-busy={loading}>

                    <div
                        className={`model-browser__toolbar${
                            isTagsHidden && !isFilterOpen && !isSortOpen
                                ? " model-browser__toolbar--hidden"
                                : ""
                        }`}
                    >
                        <ModelTabs value={tab} onChange={setTab} />
                        <ModelSort
                            value={sort}
                            onChange={setSort}
                            isOpen={isSortOpen}
                            onOpenChange={setIsSortOpen}
                            className="model-sort--anchored"
                        />
                    </div>

                    {/* Význam zvoleného štítku, aby bylo jasné, jaké modely výpis obsahuje */}
                    <p className="model-browser__tab-note">
                        {activeTab.description}
                    </p>

                    {error ? (
                        <PageMessage>{error}</PageMessage>
                    ) : models.length === 0 ? (
                        <PageMessage>{emptyMessage}</PageMessage>
                    ) : (
                        <div className="model-browser__results">
                            {isFuzzySearch && (
                                <p className="model-browser__fuzzy-note">
                                    Přesná shoda nenalezena, zobrazují se nejpodobnější modely.
                                </p>
                            )}

                            <ModelList
                                models={models}
                                onModelClick={handleModelClick}
                                pendingDescriptionIds={pendingDescriptionIds}
                            />

                            {hasMore && (
                                <div className="model-browser__more">
                                    <Button variant="outline" onClick={loadMore}>
                                        Načíst další modely
                                    </Button>
                                </div>
                            )}

                            {/* Obnova výpisu (filtry, řazení, štítek): animace s logem se pokládá přes výsledky, takže se výpis neposouvá */}
                            {loading && (
                                <div className="model-browser__loading">
                                    <LogoLoader />
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </PageContainer>
        </div>
    );
}

export default ModelBrowser;
