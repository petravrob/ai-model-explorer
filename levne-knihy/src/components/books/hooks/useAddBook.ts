import { useEffect, useState } from "react";

import { getCurrentUser } from "../../../api/userApi";
import { addBook } from "../../../api/booksApi";
import useBookForm from "./useBookForm";
import useCurrentUser from "../../user/hooks/useCurrentUser";


function useAddBook() {

    // aktuálně přihlášený uživatel
    const {
        user,
    } = useCurrentUser();

    // Stav formuláře a převod obrázku
    const {
        book: newBook,
        handleChange,
        handleImageChange,
        resetBook,
    } = useBookForm();


    // Vytvoření nového inzerátu
    const handleSubmit = async (
        e: React.FormEvent<HTMLFormElement>
    ): Promise<void> => {

        e.preventDefault();

        if (!user) {
            return;
        }

        try {

            await addBook(user, newBook);

            alert("Kniha byla přidána.");

            // Reset formuláře po úspěšném přidání knihy
            resetBook();

        } catch (error) {

            console.error(
                "Chyba při přidávání inzerátu:",
                error
            );

            alert(
                "Knihu se nepodařilo přidat."
            );

        }

    };


    return {
        user,

        newBook,

        handleChange,
        handleImageChange,

        handleSubmit,
    };
}


export default useAddBook;