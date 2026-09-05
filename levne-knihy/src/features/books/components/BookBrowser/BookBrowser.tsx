import useBookBrowser from "../../hooks/useBookBrowser";
import { BookBrowserProps } from "../../types";
import BookList from "../BookList/BookList";
import { PageContainer, PageMessage } from "@/ui";

/** Rozhraní pro zobrazení seznamu inzerátů knih. */
function BookBrowser({
    mode,
}: BookBrowserProps) {

    const {
        books,
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

