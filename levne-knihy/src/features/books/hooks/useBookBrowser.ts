import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import { Book, BookBrowserMode } from "../types";
import { useCurrentUser } from "@/features/user";
import { SEARCH_QUERY_PARAM, bookDetailUrl } from "@/routes/paths";
import { getBooks } from "../api/booksApi";

/** Převede text na malá písmena bez diakritiky pro nezávislé vyhledávání. */
const normalizeText = (text: string): string =>
    text
        .normalize("NFD")
        .replace(/\p{Diacritic}/gu, "")
        .toLowerCase();

/** Obstarává logiku zobrazení seznamu knih a přechodu na jejich detail */
function useBookBrowser(mode: BookBrowserMode) {

    const [books, setBooks] = useState<Book[]>([]);

    const [loading, setLoading] =
        useState<boolean>(true);

    const [error, setError] =
        useState<string | null>(null);

    const navigate = useNavigate();

    const [searchParams] = useSearchParams();

    const {
        user,
        error: userError,
    } = useCurrentUser();

    // Hledaný výraz z URL (např. „/?q=tolkien“)
    const searchQuery = searchParams.get(SEARCH_QUERY_PARAM) ?? "";


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

    // Filtrování podle hledaného výrazu (název i autor, bez rozlišení velikosti písmen a diakritiky)
    const normalizedQuery = normalizeText(searchQuery);

    const searchedBooks: Book[] = normalizedQuery
        ? filteredBooks.filter(
            (book) =>
                normalizeText(book.name).includes(normalizedQuery) ||
                normalizeText(book.author).includes(normalizedQuery)
        )
        : filteredBooks;


    // Přechod na stránku detailu knihy
    const handleBookClick = (
        book: Book
    ): void => {

        navigate(bookDetailUrl(book._id));

    };


    return {
        books: searchedBooks,

        searchQuery,

        handleBookClick,

        loading,

        error: error ?? userError,
    };
}


export default useBookBrowser;

