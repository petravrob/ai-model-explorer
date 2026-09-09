import "./ModelBrowser.css";

import useModelBrowser from "../../hooks/useModelBrowser";

import ModelFilterPanel from "../ModelFilterPanel/ModelFilterPanel";
import ModelList from "../ModelList/ModelList";
import { PageContainer, PageMessage } from "@/ui";

/** Rozhraní pro zobrazení seznamu modelů. */
function ModelBrowser() {

    const {
        models,
        searchQuery,
        isFuzzySearch,
        filters,
        filterOptions,
        isFilterActive,
        handleFilterChange,
        resetFilters,
        handleModelClick,

        loading,
        error,
    } = useModelBrowser();


    if (loading) {
        return (
            <PageContainer>
                <PageMessage>Načítání modelů...</PageMessage>
            </PageContainer>
        );
    }

    if (error) {
        return (
            <PageContainer>
                <PageMessage>{error}</PageMessage>
            </PageContainer>
        );
    }

    // Zpráva pro prázdný výpis, rozliší hledání a prázdnou databázi
    const emptyMessage = searchQuery
        ? `Pro hledaný výraz „${searchQuery}“ nebyly nalezeny žádné modely.`
        : isFilterActive
            ? "Podle zvolených předvoleb nebyly nalezeny žádné modely."
            : "Nebyly nalezeny žádné modely.";

    return (
        <PageContainer>
            <div className="model-browser__layout">
                <ModelFilterPanel
                    filters={filters}
                    options={filterOptions}
                    isFilterActive={isFilterActive}
                    onFilterChange={handleFilterChange}
                    onReset={resetFilters}
                />

                <div className="model-browser__content">
                    {models.length === 0 ? (
                        <PageMessage>{emptyMessage}</PageMessage>
                    ) : (
                        <>
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

