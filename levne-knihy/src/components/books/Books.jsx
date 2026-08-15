import "../../App.css";
import React, { useEffect, useState } from "react";
import { API_URL } from "../../config.js";
import BookList from "./BookList.js";
import BookDetail from "./BookDetail.tsx";


function Books () {
    const [books, setBooks] = useState([]);
    const [selectedBook, setSelectedBook] = useState("");
    

    const getBooks = () => {
        fetch(`${API_URL}/`, {
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
            { selectedBook == "" 
            ? <BookList books={books} onBookClick={handleBookClick} />
            : <BookDetail book={selectedBook} />
            }
        </div>
    )
}

export default Books;