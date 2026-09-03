import "./BookBrowser.css";

import useBookBrowser from "../../hooks/useBookBrowser";
import { BookBrowserProps } from "../../types";
import BookDetail from "../BookDetail/BookDetail";
import BookForm from "../BookForm/BookForm";
import BookList from "../BookList/BookList";
import { Button, PageContainer, PageMessage, PageTitle } from "@/ui";

/** Rozhraní pro zobrazení inzerátu knih, jejich detailu, umožňuje také jejich úpravu. */
function BookBrowser({
    mode,
}: BookBrowserProps) {

    const {
        books,
        selectedBook,
        update,
        editedBook,

        handleBookClick,
        handleBack,
        handleEdit,
        handleChange,
        handleImageChange,
        handleSubmit,
        handleDelete,

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

    if (update) {
        return (
            <PageContainer>
                <PageTitle centered>Upravit inzerát</PageTitle>

                <BookForm
                    book={editedBook}
                    onChange={handleChange}
                    onSubmit={handleSubmit}
                    submitText="Upravit inzerát"
                    showImage={false}
                    onImageChange={handleImageChange}
                />
            </PageContainer>
        );
    }

    if (!selectedBook) {
        return (
            <PageContainer>
                <BookList
                    books={books}
                    onBookClick={handleBookClick}
                />
            </PageContainer>
        );
    }

    return (
        <PageContainer>
            <Button onClick={handleBack}>
                Zpět na seznam
            </Button>

            <BookDetail book={selectedBook} />

            {mode === "user" && (
                <div className="book-browser__actions">
                    <Button onClick={handleDelete}>
                        Smazat inzerát
                    </Button>

                    <Button onClick={handleEdit}>
                        Upravit inzerát
                    </Button>
                </div>
            )}
        </PageContainer>
    );
}

export default BookBrowser;
