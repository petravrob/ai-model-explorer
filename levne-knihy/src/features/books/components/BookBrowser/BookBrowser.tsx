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
            <div id="books">
                <p>Načítání knih...</p>
            </div>
        );
    }


    if (error) {
        return (
            <div id="books">
                <p>{error}</p>
            </div>
        );
    }


    // Režim úpravy knihy
    if (update) {

        return (
            <div id="books">

                <div className="logged-in">

                    <h2>
                        Upravit inzerát
                    </h2>

                    <BookForm
                        book={editedBook}
                        onChange={handleChange}
                        onSubmit={handleSubmit}
                        submitText="Upravit inzerát"
                        showImage={false}
                        onImageChange={handleImageChange}
                    />

                </div>

            </div>
        );
    }


    // Seznam knih
    if (!selectedBook) {

        return (
            <div id="books">

                <BookList
                    books={books}
                    onBookClick={handleBookClick}
                />

            </div>
        );
    }


    // Detail vybrané knihy
    return (
        <div id="books">

            <button
                type="button"
                className="btn"
                onClick={handleBack}
            >
                Zpět na seznam
            </button>


            <BookDetail
                book={selectedBook}
            />


            {mode === "user" && (

                <div className="my-items-btn">

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