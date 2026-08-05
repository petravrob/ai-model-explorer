import "../App.css";
import React, { useEffect, useState } from "react";



function Books () {
    const [books, setBooks] = useState([]);
    const [selectedBook, setSelectedBook] = useState("");
    

    const getBooks = () => {
        fetch("http://localhost:5000/", {
          method: "GET",
        })
          .then((res) => res.json())
          .then((data) => {
              setBooks(data.data);
              console.log(data.data, "data books");
          });
    }

    const handleBookClick = (book) => {
        setSelectedBook(book);
      };

    useEffect(() => {
        getBooks();
    }, []);
    

    const handleBackButtonClick = () => {
         setSelectedBook("");
    }

    return (
        <div id="books">
            { selectedBook == "" ?
            <ul>
            {books.map(book => {
                return (
                    <li className="book" key={book._id} onClick={() => handleBookClick(book)}>
                        <p className="book-name"> {book.name} </p>
                        <p className="book-athor"> {book.author} </p>
                        <img className="book-image" src={book.image} />
                        <p className="book-price">{book.price} Kč,-</p>
                    </li>
                )
            })}
            </ul>
            :
                <div>

                    <div className="book-detail">
                        <div className="book-container">
                            <h2 className="book-name">{selectedBook.name}</h2>
                            <h4 className="book-author">{selectedBook.author}</h4>
                            <img className="book-image" src={selectedBook.image} />

                        </div>
                        <div className="book-container">
                            <p className="book-detail-text">Popis: <br />{selectedBook.description}</p>
                            <p className="book-detail-text">Stav knihy: <b>{selectedBook.state}</b></p>
                            <p className="book-detail-text">Počet stránek: <b>{selectedBook.pages}</b></p>
                            <p className="book-detail-text">Cena: <b>{selectedBook.price} Kč,-</b></p>
                            <p className="book-detail-text">Poštovné: <b>{selectedBook.delivery} Kč,-</b></p>
                            <p className="book-detail-text">Prodávající: <b>{selectedBook.fname + " " + selectedBook.lname}</b></p>
                            <p className="book-detail-text">Telefon: <b>{selectedBook.phone}</b></p>
                        </div>
                    </div>
                    <button className="btn" onClick={handleBackButtonClick}>Zpět k prohlížení</button>

                </div>
            }
        </div>
    )
}

export default Books;