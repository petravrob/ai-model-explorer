import { handleApiResponse } from "@/api/apiUtils";
import { API_URL } from "@/config";
import { Book, BookFormData } from "@/features/books";
import { getAuthHeaders } from "@/features/user/api/authApi";

/** Načte všechny inzeráty. */
export const getBooks = async (): Promise<Book[]> => {

    const response = await fetch(`${API_URL}/`, {
        method: "GET",
    });

    const data = await handleApiResponse<Book[]>(
        response,
        "Nepodařilo se načíst inzeráty."
    );

    return data.data as Book[];
};


/** Načte jeden inzerát podle jeho identifikátoru. */
export const getBook = async (
    bookId: string
): Promise<Book> => {

    const response = await fetch(
        `${API_URL}/kniha/${bookId}`,
        {
            method: "GET",
        }
    );

    const data = await handleApiResponse<Book>(
        response,
        "Nepodařilo se načíst inzerát."
    );

    return data.data as Book;
};

/** Přidá nový inzerát. */
export const addBook = async (
    book: BookFormData
): Promise<void> => {

    const response = await fetch(
        `${API_URL}/pridat-inzerat`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
                ...getAuthHeaders(),
            },
            body: JSON.stringify({
                name: book.name,
                author: book.author,
                description: book.description,
                pages: book.pages,
                price: book.price,
                state: book.state,
                delivery: book.delivery,
                base64: book.image,
            }),
        }
    );

    await handleApiResponse(
        response,
        "Nepodařilo se přidat inzerát."
    );
};


/** Upraví inzerát. */
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
                ...getAuthHeaders(),
            },
            body: JSON.stringify({
                name: book.name,
                author: book.author,
                description: book.description,
                pages: book.pages,
                state: book.state,
                price: book.price,
                delivery: book.delivery,
                base64: book.image,
            }),
        }
    );

    await handleApiResponse(
        response,
        "Nepodařilo se upravit inzerát."
    );
};


/** Smaže inzerát. */
export const deleteBook = async (
    bookId: string
): Promise<void> => {

    const response = await fetch(
        `${API_URL}/moje-inzeraty/${bookId}`,
        {
            method: "DELETE",
            headers: {
                ...getAuthHeaders(),
            },
        }
    );

    await handleApiResponse(
        response,
        "Nepodařilo se smazat inzerát."
    );
}; 
