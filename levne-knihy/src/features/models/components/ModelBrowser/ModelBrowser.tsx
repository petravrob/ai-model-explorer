import "./ModelBrowser.css";

import useModelBrowser from "../../hooks/useModelBrowser";
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
        <div className="model-browser-layout">

            <div className="model-browser-layout__sidebar">
                <ModelFilterPanel
                    filters={filters}
                    isFilterActive={isFilterActive}
                    onFilterChange={handleFilterChange}
                    onReset={resetFilters}
                />
            </div>

            <PageContainer>
                <div className="model-browser" aria-busy={loading}>

                    <div className="model-browser__toolbar">
                        <ModelTabs value={tab} onChange={setTab} />
                        <ModelSort value={sort} onChange={setSort} />
                    </div>

                    {/* Význam zvoleného štítku, aby bylo jasné, jaké modely výpis obsahuje */}
                    {isTabActive && (
                        <p className="model-browser__tab-note">
                            {activeTab.description}
                        </p>
                    )}

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
