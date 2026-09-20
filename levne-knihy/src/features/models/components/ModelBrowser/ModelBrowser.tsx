import "./ModelBrowser.css";

import useModelBrowser from "../../hooks/useModelBrowser";

import ModelFilterPanel from "../ModelFilterPanel/ModelFilterPanel";
import ModelList from "../ModelList/ModelList";
import ModelSort from "../ModelSort/ModelSort";
import { PageContainer, PageMessage } from "@/ui";

/** Rozhraní pro zobrazení seznamu modelů. */
function ModelBrowser() {

    const {
        models,
        searchQuery,
        isFuzzySearch,
        filters,
        isFilterActive,
        handleFilterChange,
        resetFilters,
        sort,
        handleSortChange,
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
                <PageMessage>{error ?? "Načítání modelů..."}</PageMessage>
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
        <PageContainer>
            <div className="model-browser__layout">

                <ModelFilterPanel
                    filters={filters}
                    isFilterActive={isFilterActive}
                    onFilterChange={handleFilterChange}
                    onReset={resetFilters}
                />

                <div className="model-browser__content" aria-busy={loading}>
                    <ModelSort value={sort} onChange={handleSortChange} />
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
                        </>
                    )}
                </div>
            </div>
        </PageContainer>
    );
}

export default ModelBrowser;

