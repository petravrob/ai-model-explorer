import React, { useEffect, useState } from "react";
import { API_URL } from "../../config.js";
import BookList from "./BookList";
import BookDetail from "./BookDetail";
import { Book } from "./types";

function Books() {
    const [books, setBooks] = useState<Book[]>([]);
    const [selectedBook, setSelectedBook] = useState<Book | null>(null);

    const getBooks = () => {
        fetch(`${API_URL}/`, {
            method: "GET",
        })
            .then((res) => res.json())
            .then((data) => {
                setBooks(data.data);
            });
    };

    const handleBookClick = (book: Book) => {
        setSelectedBook(book);
    };

    useEffect(() => {
        getBooks();
    }, []);

    return (
        <div id="books">
            {selectedBook === null ? (
                <BookList
                    books={books}
                    onBookClick={handleBookClick}
                />
            ) : (
                <BookDetail book={selectedBook} />
            )}
        </div>
    );
}

export default Books;