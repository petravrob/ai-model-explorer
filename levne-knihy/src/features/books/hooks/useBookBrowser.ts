import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { Book, BookBrowserMode } from "../types";
import { useCurrentUser } from "@/features/user";
import { bookDetailUrl } from "@/routes/paths";
import { getBooks } from "../api/booksApi";

/** Obstarává logiku zobrazení seznamu knih a přechodu na jejich detail */
function useBookBrowser(mode: BookBrowserMode) {

    const [books, setBooks] = useState<Book[]>([]);

    const [loading, setLoading] =
        useState<boolean>(true);

    const [error, setError] =
        useState<string | null>(null);

    const navigate = useNavigate();

    const {
        user,
        error: userError,
    } = useCurrentUser();


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

                const errorMessage =
                    error instanceof Error
                        ? error.message
                        : "Nepodařilo se načíst knihy.";

                setError(errorMessage);

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


    // Přechod na stránku detailu knihy
    const handleBookClick = (
        book: Book
    ): void => {

        navigate(bookDetailUrl(book._id));

    };


    return {
        books: filteredBooks,

        handleBookClick,

        loading,

        error: error ?? userError,
    };
}


export default useBookBrowser;

