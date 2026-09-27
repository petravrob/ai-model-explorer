import "./ModelBrowser.css";

import useModelBrowser from "../../hooks/useModelBrowser";
import { Button, PageContainer, PageMessage } from "@/ui";

import ModelFilterPanel from "../ModelFilterPanel/ModelFilterPanel";
import ModelList from "../ModelList/ModelList";
import ModelSort from "../ModelSort/ModelSort";

/** Rozhraní pro zobrazení seznamu modelů. */
function ModelBrowser() {

    const {
        models,
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
                    <PageMessage>{error ?? "Načítání modelů..."}</PageMessage>
                </div>
            </PageContainer>
        );
    }

    // Zpráva pro prázdný výpis, rozliší hledání a prázdnou databázi
    const emptyMessage = searchQuery
        ? `Pro hledaný výraz „${searchQuery}“ nebyly nalezeny žádné modely.`
        : isFilterActive
            ? "Podle zvolených filtrů nebyly nalezeny žádné modely."
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
                        <ModelSort value={sort} onChange={setSort} />
                    </div>

                    {error ? (
                        <PageMessage>{error}</PageMessage>
                    ) : models.length === 0 ? (
                        <PageMessage>{emptyMessage}</PageMessage>
                    ) : (
                        <>
                            {loading && (
                                <p className="model-browser__refresh-note" role="status">
                                    Aktualizace modelů...
                                </p>
                            )}

                            {isFuzzySearch && (
                                <p className="model-browser__fuzzy-note">
                                    Přesná shoda nenalezena, zobrazují se nejpodobnější modely.
                                </p>
                            )}

                            <ModelList
                                models={models}
                                onModelClick={handleModelClick}
                            />

                            {hasMore && (
                                <div className="model-browser__more">
                                    <Button variant="outline" onClick={loadMore}>
                                        Načíst další modely
                                    </Button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </PageContainer>
        </div>
    );
}

export default ModelBrowser;
