import "./BookList.css";

import { BookListProps } from "../../types";

/** Zobrazuje senzma knih */
function BookList({ books, onBookClick }: BookListProps) {
    return (
        <ul className="book-list">
            {books.map((book) => (
                <li
                    className="book-list__item"
                    key={book._id}
                    onClick={() => onBookClick(book)}
                >
                    <img
                        src={book.image}
                        alt={book.name}
                    />

                    <div>
                        <p className="book-list__name">{book.name}</p>
                        <p className="book-list__author">{book.author}</p>
                        <p className="book-list__price">
                            {book.price} Kč,-
                        </p>
                    </div>
                </li>
            ))}
        </ul>
    );
}

export default BookList;
