import { API_URL } from "../config.js";
import { Book, BookFormData } from "../components/books/types.js";
import ApiResponse from "../components/types.js";

/** Načtení všech inzerátů */
export const getBooks = async (): Promise<Book[]> => {

    const response = await fetch(`${API_URL}/`, {
        method: "GET",
    });

    if (!response.ok) {
        throw new Error(
            "Nepodařilo se načíst inzeráty."
        );
    }

    const data: ApiResponse<Book[]> = await response.json();

    return data.data;
};


/** Přidání nového inzerátu */
export const addBook = async (
    user: {
        uname: string;
        fname: string;
        lname: string;
        phone: string;
    },
    book: BookFormData
): Promise<void> => {

    const response = await fetch(
        `${API_URL}/pridat-inzerat`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
            },
            body: JSON.stringify({
                uname: user.uname,
                name: book.name,
                author: book.author,
                description: book.description,
                pages: book.pages,
                price: book.price,
                state: book.state,
                delivery: book.delivery,
                fname: user.fname,
                lname: user.lname,
                phone: user.phone,
                base64: book.image,
            }),
        }
    );

    if (!response.ok) {
        throw new Error(
            "Nepodařilo se přidat inzerát."
        );
    }

    const data: ApiResponse<unknown> = await response.json();

    if (data.status !== "ok") {
        throw new Error(
            "Nepodařilo se přidat inzerát."
        );
    }
};


/** Úprava inzerátu */
export const updateBook = async (
    bookId: string,
    book: BookFormData
): Promise<void> => {

    const response = await fetch(
        `${API_URL}/moje-inzeraty/${bookId}`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
            },
            body: JSON.stringify({
                name: book.name,
                author: book.author,
                description: book.description,
                pages: book.pages,
                state: book.state,
                price: book.price,
                delivery: book.delivery,
            }),
        }
    );

    if (!response.ok) {
        throw new Error(
            "Nepodařilo se upravit inzerát."
        );
    }

    const data: ApiResponse<unknown> = await response.json();

    if (data.status !== "ok") {
        throw new Error(
            "Nepodařilo se upravit inzerát."
        );
    }
};


/** Smazání inzerátu */
export const deleteBook = async (
    bookId: string
): Promise<void> => {

    const response = await fetch(
        `${API_URL}/moje-inzeraty/${bookId}`,
        {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                bookId,
            }),
        }
    );

    if (!response.ok) {
        throw new Error(
            "Nepodařilo se smazat inzerát."
        );
    }

    const data: ApiResponse<unknown> = await response.json();

    if (data.status !== "ok") {
        throw new Error(
            "Nepodařilo se smazat inzerát."
        );
    }
};
