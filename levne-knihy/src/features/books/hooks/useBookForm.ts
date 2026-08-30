import { useState } from "react";
import React from "react";
import { Book, BookFormData, BookState } from "../types";

export const emptyBook: BookFormData = {
    name: "",
    author: "",
    description: "",
    pages: "",
    state: BookState.NEW,
    price: "",
    delivery: "",
    image: "",
};

/**
 * Řeší logiku formuláře inzerátu pro knihu
 */
function useBookForm() {
    const [book, setBook] = useState<BookFormData>(emptyBook);

    // Nastavení nového stavu knihy při změně pole formuláře
    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ): void => {
        const { name, value, type } = e.target;

        setBook((previousBook) => ({
            ...previousBook,
            [name]: type === "number"
                ? value === ""
                    ? ""
                    : Number(value)
                : value,
        }));
    };

    // Načte obrázek ze souboru a převede ho na Base64
    const handleImageChange = (
        e: React.ChangeEvent<HTMLInputElement>
    ): void => {
        const file = e.target.files?.[0];

        if (!file) {
            return;
        }

        const reader = new FileReader();

        reader.onload = () => {
            setBook((previousBook) => ({
                ...previousBook,
                image: reader.result as string,
            }));
        };

        reader.onerror = (error) => {
            console.error(
                "Chyba při převodu obrázku:",
                error
            );
        };

        reader.readAsDataURL(file);
    };

    // Inicializace formuláře při úpravě existující knihy
    const initializeBook = (selectedBook: Book): void => {
        const bookForForm: BookFormData = {
            name: selectedBook.name,
            author: selectedBook.author,
            description: selectedBook.description,
            pages: selectedBook.pages,
            state: selectedBook.state,
            price: selectedBook.price,
            delivery: selectedBook.delivery,
            image: selectedBook.image,
        };

        setBook(bookForForm);
    };

    // Reset formuláře
    const resetBook = (): void => {
        setBook(emptyBook);
    };

    return {
        book,
        handleChange,
        handleImageChange,
        initializeBook,
        resetBook,
    };
}

export default useBookForm;