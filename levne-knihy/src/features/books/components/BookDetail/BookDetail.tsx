import "./BookDetail.css";

import { Book } from "../../types";

/** Zobrazuje detailní informace o knize. */
function BookDetail({ book }: { book: Book }) {
    return (
        <article className="book-detail">
            <div className="book-detail__cover">
                <img
                    src={book.image}
                    alt={book.name}
                />
            </div>

            <div className="book-detail__info">
                <header>
                    <h2>{book.name}</h2>
                    <p className="author">{book.author}</p>
                    <p className="price">{book.price} Kč,-</p>
                </header>

                <div className="book-detail__details">
                    <div>
                        <span>Stav</span>
                        <strong>{book.state}</strong>
                    </div>

                    <div>
                        <span>Stránek</span>
                        <strong>{book.pages}</strong>
                    </div>

                    <div>
                        <span>Poštovné</span>
                        <strong>{book.delivery} Kč</strong>
                    </div>
                </div>

                <section>
                    <h3>Popis</h3>
                    <p>{book.description}</p>
                </section>

                <section>
                    <h3>Prodejce</h3>
                    <p className="seller">{book.fname} {book.lname}</p>
                    <p className="phone">{book.phone}</p>
                </section>
            </div>
        </article>
    );
}

export default BookDetail;
