import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import { Book } from "../types";
import useBookForm from "./useBookForm";
import { useCurrentUser } from "@/features/user";
import { ROUTE_PATHS } from "@/routes/paths";
import { getBook, updateBook, deleteBook } from "../api/booksApi";

/** Obstarává logiku stránky detailu knihy včetně její úpravy a mazání */
function useBookDetail(bookId: string | undefined) {

    const [book, setBook] =
        useState<Book | null>(null);

    const [editing, setEditing] =
        useState<boolean>(false);

    const [loading, setLoading] =
        useState<boolean>(true);

    const [error, setError] =
        useState<string | null>(null);

    const navigate = useNavigate();

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


    // Načtení knihy podle identifikátoru v adrese
    useEffect(() => {

        const loadBook = async (): Promise<void> => {

            if (!bookId) {
                setBook(null);
                setLoading(false);
                return;
            }

            try {

                setLoading(true);
                setError(null);

                const loadedBook = await getBook(bookId);

                setBook(loadedBook);

            } catch (error) {

                console.error(
                    "Nepodařilo se načíst knihu:",
                    error
                );

                const errorMessage =
                    error instanceof Error
                        ? error.message
                        : "Nepodařilo se načíst knihu.";

                setError(errorMessage);

            } finally {

                setLoading(false);

            }

        };

        loadBook();

    }, [bookId]);

    // Příznak, zda si může přihlášený uživatel knihu upravit nebo smazat
    const canManage: boolean =
        Boolean(book && user && book.uname === user.uname);


    // Návrat zpět na předchozí stránku (nebo na seznam knih)
    const handleBack = (): void => {

        if (window.history.state && window.history.state.idx > 0) {
            navigate(-1);
        } else {
            navigate(ROUTE_PATHS.home);
        }

    };


    // Přechod do režimu úpravy knihy
    const handleEdit = (): void => {

        if (!book) {
            return;
        }

        initializeBook(book);

        setEditing(true);

    };


    // Uložení upravené knihy
    const handleSubmit = async (
        e: React.FormEvent<HTMLFormElement>
    ): Promise<void> => {

        e.preventDefault();

        if (!book) {
            return;
        }

        try {

            await updateBook(
                book._id,
                editedBook
            );


            // Lokální aktualizace zobrazené knihy
            const updatedBook: Book = {
                ...book,
                ...editedBook,

                pages: editedBook.pages as number,
                price: editedBook.price as number,
                delivery: editedBook.delivery as number,
            };


            setBook(updatedBook);

            setEditing(false);

            toast.success("Údaje byly upraveny.");

        } catch (error) {

            console.error(
                "Chyba při úpravě:",
                error
            );

            const errorMessage =
                error instanceof Error
                    ? error.message
                    : "Údaje se nepodařilo upravit.";

            toast.error(errorMessage);
        }

    };


    // Smazání knihy
    const handleDelete = async (): Promise<void> => {

        if (!book) {
            return;
        }

        try {

            await deleteBook(book._id);

            toast.success("Kniha byla smazána.");

            // Návrat na seznam inzerátů uživatele
            navigate(ROUTE_PATHS.myAdvertisements);

        } catch (error) {

            console.error(
                "Chyba při mazání:",
                error
            );

            const errorMessage =
                error instanceof Error
                    ? error.message
                    : "Knihu se nepodařilo smazat.";

            toast.error(errorMessage);
        }

    };


    return {
        book,

        canManage,

        editing,

        editedBook,

        handleChange,
        handleImageChange,

        handleBack,
        handleEdit,
        handleSubmit,
        handleDelete,

        loading,

        error: error ?? userError,
    };
}


export default useBookDetail;
