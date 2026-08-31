import "./BookBrowser.css";

import useBookBrowser from "../../hooks/useBookBrowser";
import { BookBrowserProps } from "../../types";
import BookDetail from "../BookDetail/BookDetail";
import BookForm from "../BookForm/BookForm";
import BookList from "../BookList/BookList";

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
            <div className="book-browser">
                <p className="book-browser__message">Načítání knih...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="book-browser">
                <p className="book-browser__message">{error}</p>
            </div>
        );
    }

    if (update) {
        return (
            <div className="book-browser">
                <h2>Upravit inzerát</h2>

                <BookForm
                    book={editedBook}
                    onChange={handleChange}
                    onSubmit={handleSubmit}
                    submitText="Upravit inzerát"
                    showImage={false}
                    onImageChange={handleImageChange}
                />
            </div>
        );
    }

    if (!selectedBook) {
        return (
            <div className="book-browser">
                <BookList
                    books={books}
                    onBookClick={handleBookClick}
                />
            </div>
        );
    }

    return (
        <div className="book-browser">
            <button
                type="button"
                className="btn"
                onClick={handleBack}
            >
                Zpět na seznam
            </button>

            <BookDetail book={selectedBook} />

            {mode === "user" && (
                <div className="book-browser__actions">
                    <button
                        type="button"
                        className="btn"
                        onClick={handleDelete}
                    >
                        Smazat inzerát
                    </button>

                    <button
                        type="button"
                        className="btn"
                        onClick={handleEdit}
                    >
                        Upravit inzerát
                    </button>
                </div>
            )}
        </div>
    );
}

export default BookBrowser;
