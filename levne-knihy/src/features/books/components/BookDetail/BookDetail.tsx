import "./BookDetail.css";

import { Book } from "../../types";

/** Zobrazuje detailní informace o knize. */
function BookDetail({ book }: { book: Book }) {
    return (
        <div className="book-detail">
            <div className="book-container">
                <h2 className="book-name">{book.name}</h2>
                
                <h4 className="book-author">{book.author}</h4>

                <img
                    className="book-image"
                    src={book.image}
                    alt={book.name}
                />
            </div>

            <div className="book-container">
                <p className="book-detail-text">
                    Popis: <br />
                    {book.description}
                </p>

                <p className="book-detail-text">
                    Stav knihy: <b>{book.state}</b>
                </p>

                <p className="book-detail-text">
                    Počet stránek: <b>{book.pages}</b>
                </p>

                <p className="book-detail-text">
                    Cena: <b>{book.price} Kč,-</b>
                </p>

                <p className="book-detail-text">
                    Poštovné: <b>{book.delivery} Kč,-</b>
                </p>

                <p className="book-detail-text">
                    Prodávající: <b>{book.fname} {book.lname}</b>
                </p>

                <p className="book-detail-text">
                    Telefon: <b>{book.phone}</b>
                </p>
            </div>
        </div>
    );
}

export default BookDetail;