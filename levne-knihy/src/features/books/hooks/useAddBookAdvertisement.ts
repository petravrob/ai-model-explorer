import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import useBookForm from "./useBookForm";
import { useCurrentUser } from "@/features/user";
import { ROUTE_PATHS } from "@/routes/paths";
import { addBook } from "./api/booksApi";


/** Umožňuje vytvoření nového inzerátu */
function useAddBookAdvertisement() {

    // aktuálně přihlášený uživatel
    const {
        user,
    } = useCurrentUser();

    const navigate = useNavigate();

    // Stav formuláře a převod obrázku
    const {
        book: newBook,
        handleChange,
        handleImageChange,
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

            // Přechod na seznam inzerátů uživatele
            navigate(ROUTE_PATHS.myAdvertisements);

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
        newBook,

        handleChange,
        handleImageChange,

        handleSubmit,
    };
}


export default useAddBookAdvertisement;

