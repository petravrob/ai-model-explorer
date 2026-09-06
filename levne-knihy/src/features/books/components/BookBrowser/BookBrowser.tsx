import "./BookBrowser.css";

import useBookBrowser from "../../hooks/useBookBrowser";
import { BookBrowserProps } from "../../types";
import BookList from "../BookList/BookList";
import { LinkButton, PageContainer, PageMessage } from "@/ui";
import { homeSearchUrl } from "@/routes/paths";

/** Rozhraní pro zobrazení seznamu inzerátů knih. */
function BookBrowser({
    mode,
}: BookBrowserProps) {

    const {
        books,
        searchQuery,
        handleBookClick,

        loading,
        error,
    } = useBookBrowser(mode);


    if (loading) {
        return (
            <PageContainer>
                <PageMessage>Načítání knih...</PageMessage>
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

    if (books.length === 0) {

        // Prázdný výpis hledání v „moje inzeráty“ – upozorní, že se hledalo
        // pouze mezi inzeráty přihlášeného uživatele, a nabídne hledání mezi všemi knihami
        if (mode === "user" && searchQuery) {
            return (
                <PageContainer>
                    <div className="book-browser__empty">
                        <PageMessage>
                            {`Pro hledaný výraz „${searchQuery}“ nebyly ve vašich inzerátech nalezeny žádné knihy.`}
                        </PageMessage>

                        <LinkButton to={homeSearchUrl(searchQuery)}>
                            Prohledat všechny knihy
                        </LinkButton>
                    </div>
                </PageContainer>
            );  
        }

        // Zpráva pro ostatní prázdné výpisy – rozliší hledání a režim „moje inzeráty“
        const emptyMessage = searchQuery
            ? `Pro hledaný výraz „${searchQuery}“ nebyly nalezeny žádné knihy.`
            : mode === "user"
                ? "Nemáte žádné inzeráty."
                : "Nebyly nalezeny žádné knihy.";

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
            <BookList
                books={books}
                onBookClick={handleBookClick}
            />
        </PageContainer>
    );
}

export default BookBrowser;

