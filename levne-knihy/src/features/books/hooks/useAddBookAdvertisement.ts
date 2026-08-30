import { toast } from "react-toastify";

import { addBook } from "../../../api/booksApi";
import useBookForm from "./useBookForm";
import useCurrentUser from "../../user/hooks/useCurrentUser";


/** Umožňuje vytvoření nového inzerátu */
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

            const errorMessage =
                error instanceof Error
                    ? error.message
                    : "Knihu se nepodařilo přidat.";

            toast.error(errorMessage);
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
