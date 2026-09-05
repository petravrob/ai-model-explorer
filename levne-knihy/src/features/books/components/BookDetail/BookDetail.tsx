import "./BookDetail.css";

import { Book } from "../../types";
import { DetailItem, SectionTitle } from "@/ui";

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
                    <DetailItem label="Stav" value={book.state} />
                    <DetailItem label="Stránek" value={book.pages} />
                    <DetailItem label="Poštovné" value={`${book.delivery} Kč`} />
                </div>

                <section>
                    <SectionTitle>Popis</SectionTitle>
                    <p>{book.description}</p>
                </section>

                <section>
                    <SectionTitle>Prodejce</SectionTitle>
                    <p className="seller">{book.fname} {book.lname}</p>
                    <p className="phone">{book.phone}</p>
                </section>
            </div>
        </article>
    );
}

export default BookDetail;