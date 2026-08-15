import React from "react";

export interface Book {
    _id: string;
    name: string;
    author: string;
    image: string;
    price: number;
    description: string;
    state: string;
    pages: number;
    delivery: number;
    fname: string;
    lname: string;
    phone: string;
}

interface BookListProps {
    books: Book[];
    onBookClick: (book: Book) => void;
}

function BookList({ books, onBookClick }: BookListProps) {
    return (
        <ul>
            {books.map((book) => (
                <li
                    className="book"
                    key={book._id}
                    onClick={() => onBookClick(book)}
                >
                    <p className="book-name">{book.name}</p>

                    <p className="book-author">{book.author}</p>

                    <img
                        className="book-image"
                        src={book.image}
                        alt={book.name}
                    />

                    <p className="book-price">
                        {book.price} Kč,-
                    </p>
                </li>
            ))}
        </ul>
    );
}

export default BookList;