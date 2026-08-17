import { BookListProps } from "../types";

/** Zobrazuje senzma knih */
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