import { useEffect, useState } from "react";
import { toast } from "react-toastify";

import { getCurrentUser } from "../../../api/userApi";
import { addBook } from "../../../api/booksApi";
import useBookForm from "./useBookForm";
import useCurrentUser from "../../user/hooks/useCurrentUser";


function useAddBookAdvertisement() {

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

            await addBook(newBook);

            toast.success("Kniha byla přidána.");

            // Reset formuláře po úspěšném přidání knihy
            resetBook();

        } catch (error) {

            console.error(
                "Chyba při přidávání inzerátu:",
                error
            );

            toast.error("Knihu se nepodařilo přidat.");
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


export default useAddBookAdvertisement;
