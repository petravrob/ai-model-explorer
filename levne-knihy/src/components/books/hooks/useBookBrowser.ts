import { useEffect, useState } from "react";
import { toast } from "react-toastify";

import {
    Book,
    BookBrowserMode,
} from "../types";

import {
    getBooks,
    updateBook,
    deleteBook,
} from "../../../api/booksApi";

import useBookForm from "./useBookForm";
import useCurrentUser from "../../user/hooks/useCurrentUser";

/** Obstarává logiku zobrazení, výběru, úpravy a mazání knih */
function useBookBrowser(mode: BookBrowserMode) {

    const [books, setBooks] = useState<Book[]>([]);

    const [selectedBook, setSelectedBook] =
        useState<Book | null>(null);

    const [update, setUpdate] =
        useState<boolean>(false);

    const [loading, setLoading] =
        useState<boolean>(true);

    const [error, setError] =
        useState<string | null>(null);

    const {
        user,
        error: userError,
    } = useCurrentUser();


    // Zpracování formuláře a převod obrázku
    const {
        book: editedBook,
        handleChange,
        handleImageChange,
        initializeBook,
    } = useBookForm();


    // Načtení všech knih
    useEffect(() => {

        const loadBooks = async (): Promise<void> => {

            try {

                setLoading(true);
                setError(null);

                const data = await getBooks();

                setBooks(data);

            } catch (error) {

                console.error(
                    "Nepodařilo se načíst knihy:",
                    error
                );

                setError(
                    "Nepodařilo se načíst knihy."
                );

            } finally {

                setLoading(false);

            }
        };

        loadBooks();

    }, []);

    /* Filtrování knih podle režimu
        * "all"  → všechny knihy
        * "user" → pouze knihy aktuálního uživatele */
    const filteredBooks: Book[] =
        mode === "user"
            ? books.filter(
                (book) => book.uname === user?.uname
            )
            : books;


    // Výběr knihy ze seznamu
    const handleBookClick = (
        book: Book
    ): void => {

        setSelectedBook(book);

    };


    // Návrat ze stránky detailu zpět na seznam knih
    const handleBack = (): void => {

        setSelectedBook(null);
        setUpdate(false);

    };


    // Přechod na režim úpravy knihy (Book obsahuje číselné hodnoty zatímco formulář používá string)
    const handleEdit = (): void => {

        if (!selectedBook) {
            return;
        }

        initializeBook(selectedBook);

        setUpdate(true);

    };


    // Uložení upravené knihy.
    const handleSubmit = async (
        e: React.FormEvent<HTMLFormElement>
    ): Promise<void> => {

        e.preventDefault();

        if (!selectedBook) {
            return;
        }

        try {

            await updateBook(
                selectedBook._id,
                editedBook
            );


            // Lokální stav pro úpravu knihy
            const updatedBook: Book = {
                ...selectedBook,
                ...editedBook,

                pages: editedBook.pages as number,
                price: editedBook.price as number,
                delivery: editedBook.delivery as number,
            };


            // Aktualizace seznamu knih
            setBooks((previousBooks) =>
                previousBooks.map((book) =>
                    book._id === updatedBook._id
                        ? updatedBook
                        : book
                )
            );


            // Aktualizace právě zobrazené a upravené knihy
            setSelectedBook(updatedBook);

            setUpdate(false);

            toast.success("Údaje byly upraveny.");
            
        } catch (error) {

            console.error(
                "Chyba při úpravě:",
                error
            );

            toast.error("Údaje se nepodařilo upravit.");
        }
    };


    // Smazání knihy
    const handleDelete = async (): Promise<void> => {

        if (!selectedBook) {
            return;
        }

        try {

            await deleteBook(
                selectedBook._id
            );


            // Odstranění knihy z lokálního stavu
            setBooks((previousBooks) =>
                previousBooks.filter(
                    (book) =>
                        book._id !== selectedBook._id
                )
            );


            // Návrat na seznam knih (selectedBook určuje, která kniha je zobrazovaná v detailním režimu)
            setSelectedBook(null);

            toast.success("Kniha byla smazána.");
        
        } catch (error) {

            console.error(
                "Chyba při mazání:",
                error
            );

            toast.error("Knihu se nepodařilo smazat.");
        
        }

    };


    return {
        books: filteredBooks,

        selectedBook,

        update,

        editedBook,

        handleChange,
        handleBookClick,
        handleBack,
        handleEdit,
        handleImageChange,
        handleSubmit,
        handleDelete,

        loading,
        error: error ?? userError,
    };
}


export default useBookBrowser;