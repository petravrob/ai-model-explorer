import "./ModelBrowser.css";

import useModelBrowser from "../../hooks/useModelBrowser";

import ModelList from "../ModelList/ModelList";
import { PageContainer, PageMessage } from "@/ui";

/** Rozhraní pro zobrazení seznamu modelů. */
function ModelBrowser() {

    const {
        models,
        searchQuery,
        isFuzzySearch,
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

    if (models.length === 0) {

        // Zpráva pro prázdný výpis, rozliší hledání a prázdnou databázi
        const emptyMessage = searchQuery
            ? `Pro hledaný výraz „${searchQuery}“ nebyly nalezeny žádné modely.`
            : "Nebyly nalezeny žádné modely.";

        return (
            <PageContainer>
                <PageMessage>
                    {emptyMessage}
                </PageMessage>
            </PageContainer>
        );
    }

    return (
        <PageContainer>
            {isFuzzySearch && (
                <p className="model-browser__fuzzy-note">
                    Přesná shoda nenalezena, zobrazují se nejpodobnější modely.
                </p>
            )}

            <ModelList
                models={models}
                onModelClick={handleModelClick}
            />
        </PageContainer>
    );
}

export default ModelBrowser;

