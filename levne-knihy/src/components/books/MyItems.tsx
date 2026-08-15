import React, { useEffect, useState } from "react";
import { API_URL } from "../../config.js";
import BookList from "./BookList.tsx";
import BookDetail from "./BookDetail.tsx";
import BookForm from "./BookForm.tsx";
import { Book, BookFormData } from "./types";

function MyItems() {
    const [myItems, setMyItems] = useState<Book[]>([]);
    const [userName, setUserName] = useState<string>("");
    const [selectedBook, setSelectedBook] = useState<Book | null>(null);
    const [update, setUpdate] = useState<boolean>(false);

    const [editedBook, setEditedBook] = useState<BookFormData>({
        name: "",
        author: "",
        description: "",
        pages: "",
        state: "",
        price: "",
        delivery: "",
        image: "",
    });

    // Načtení údajů o přihlášeném uživateli
    useEffect(() => {
        fetch(`${API_URL}/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
            },
            body: JSON.stringify({
                token: window.localStorage.getItem("token"),
            }),
        })
            .then((res) => res.json())
            .then((data: ApiResponse<{
                uname: string;
            }>) => {
                setUserName(data.data.uname);
            })
            .catch((error) => {
                console.error("Nepodařilo se načíst uživatele:", error);
            });
    }, []);

    // Načtení všech inzerátů
    useEffect(() => {
        const getMyItems = async () => {
            try {
                const response = await fetch(`${API_URL}/`, {
                    method: "GET",
                });

                const data: ApiResponse<Book[]> = await response.json();

                setMyItems(data.data);
            } catch (error) {
                console.error("Nepodařilo se načíst inzeráty:", error);
            }
        };

        getMyItems();
    }, []);


    // Zobrazení inzerátů přihlášeného uživatele
    const filteredItems: Book[] = myItems.filter(
        (item) => item.uname === userName
    );

    // Výběr knihy ze seznamu
    const handleBookClick = (book: Book): void => {
        setSelectedBook(book);
    };


    // Přechod na úpravu vybrané knihy uživatele 
    const handleChange = (): void => {
        if (!selectedBook) {
            return;
        }

        setEditedBook({
            name: selectedBook.name,
            author: selectedBook.author,
            description: selectedBook.description,
            pages: String(selectedBook.pages),
            state: selectedBook.state,
            price: String(selectedBook.price),
            delivery: String(selectedBook.delivery),
            image: selectedBook.image,
        });

        setUpdate(true);
    };


    // Převod nahraného obrázku na base64
    const convertToBase64 = (
        e: React.ChangeEvent<HTMLInputElement>
    ): void => {
        const file = e.target.files?.[0];

        if (!file) {
            return;
        }

        const reader = new FileReader();

        reader.readAsDataURL(file);

        reader.onload = () => {
            setEditedBook((previousBook) => ({
                ...previousBook,
                image: reader.result as string,
            }));
        };

        reader.onerror = (error) => {
            console.error(
                "Chyba při převodu obrázku na Base64:",
                error
            );
        };
    };


    // Uložení upraveného inzerátu
    const handleSubmit = async (
        e: React.FormEvent<HTMLFormElement>
    ): Promise<void> => {
        e.preventDefault();

        if (!selectedBook) {
            return;
        }

        const bookId = selectedBook._id;

        try {
            const response = await fetch(
                `${API_URL}/moje-inzeraty/${bookId}`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Accept: "application/json",
                    },
                    body: JSON.stringify({
                        name: editedBook.name,
                        author: editedBook.author,
                        description: editedBook.description,
                        pages: editedBook.pages,
                        state: editedBook.state,
                        price: editedBook.price,
                        delivery: editedBook.delivery,
                    }),
                }
            );

            const data: ApiResponse<unknown> = await response.json();

            if (data.status === "ok") {
                alert("Údaje byly upraveny.");

                // aktualizace stavu přidaných inzerátů uživatele a právě vybrané knihy (zobrazí se její detail)
                setMyItems((previousItems) =>
                    previousItems.map((item) =>
                        item._id === bookId
                            ? {
                                ...item,
                                ...editedBook,
                                pages: Number(editedBook.pages),
                                price: Number(editedBook.price),
                                delivery: Number(editedBook.delivery),
                            }
                            : item
                    )
                );

                setSelectedBook((previousBook) =>
                    previousBook
                        ? {
                            ...previousBook,
                            ...editedBook,
                            pages: Number(editedBook.pages),
                            price: Number(editedBook.price),
                            delivery: Number(editedBook.delivery),
                        }
                        : null
                );

                setUpdate(false);
            } else {
                alert("Něco se nepovedlo.");
            }
        } catch (error) {
            console.error("Chyba při úpravě inzerátu:", error);
            alert("Něco se nepovedlo.");
        }
    };


    // Smazání inzerátu
    const handleDeleteButtonClick = async (): Promise<void> => {
        if (!selectedBook) {
            return;
        }

        const bookId = selectedBook._id;

        try {
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

            const data: ApiResponse<unknown> = await response.json();

            if (data.status === "ok") {
                alert("Kniha byla smazána.");

                setMyItems((previousItems) =>
                    previousItems.filter(
                        (item) => item._id !== bookId
                    )
                );

                setSelectedBook(null);
            } else {
                alert("Knihu se nepodařilo smazat.");
            }
        } catch (error) {
            console.error("Error:", error);
            alert("Něco se nepovedlo.");
        }
    };


    return (
        <div id="books">

            {selectedBook === null ? (

                <BookList
                    books={filteredItems}
                    onBookClick={handleBookClick}
                />

            ) : update ? (

                <div className="logged-in">

                    <h2>Upravit inzerát</h2>

                    <BookForm
                        book={editedBook}
                        setBook={setEditedBook}
                        onSubmit={handleSubmit}
                        submitText="Upravit inzerát"
                        showImage={false}
                        onImageChange={convertToBase64}
                    />

                </div>

            ) : (

                <div>

                    <BookDetail book={selectedBook} />

                    <div className="my-items-btn">

                        <button
                            type="button"
                            className="btn"
                            onClick={handleDeleteButtonClick}
                        >
                            Smazat inzerát
                        </button>

                        <button
                            type="button"
                            className="btn"
                            onClick={handleChange}
                        >
                            Upravit inzerát
                        </button>

                    </div>

                </div>
            )}

        </div>
    );
}

export default MyItems;