import "../../App.css";
import React, { useEffect, useState } from "react";
import { API_URL } from "../../config.js";
import BookList from "./BookList.tsx";
import BookDetail from "./BookDetail.tsx";
import BookForm from "./BookForm.tsx";


function MyItems() {
    const [myItems, setMyItems] = useState([]);
    const [userName, setUserName] = useState("");
    const [filteredItems, setFilteredItems] = useState([]);
    const [isFiltered, setIsFiltered] = useState(false);
    const [selectedBook, setSelectedBook] = useState("");
    const [update, setUpdate] = useState(false);

    const [editedBook, setEditedBook] = useState({
        name: "",
        author: "",
        description: "",
        pages: "",
        state: "",
        price: "",
        delivery: "",
        image: "",
    });

    const [uname, setUname] = useState("");
    const [fname, setFname] = useState("");
    const [lname, setLname] = useState("");
    const [phone, setPhone] = useState("");
    const [email, setEmail] = useState("");
    const [_id, setId] = useState("");


    const handleSubmit = (e) => {
        e.preventDefault();

        const bookId = selectedBook._id;

        fetch(`${API_URL}/moje-inzeraty/${bookId}`, {
            method: "POST",
            crossDomain: true,
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
        })
            .then((res) => res.json())
            .then((data) => {
                if (data.status == "ok") {
                    alert("Údaje byly upraveny.");
                } else {
                    alert("Něco se nepovedlo.");
                }
            });

        setUpdate(false);
    }


    const convertToBase64 = (e) => {
        var reader = new FileReader();

        reader.readAsDataURL(e.target.files[0]);

        reader.onload = () => {
            setEditedBook({
                ...editedBook,
                image: reader.result,
            });
        };

        reader.onerror = error => {
            console.log("error convert to base64", error);
        };
    }


    useEffect(() => {
        fetch(`${API_URL}/`, {
            method: "POST",
            crossDomain: true,
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
            },
            body: JSON.stringify({
                token: window.localStorage.getItem("token"),
            }),
        })
            .then((res) => res.json())
            .then((data) => {
                setUname(data.data.uname);
                setFname(data.data.fname);
                setLname(data.data.lname);
                setPhone(data.data.phone);
                setEmail(data.data.email);
                setId(data.data._id);
            });
    }, []);


    useEffect(() => {
        const user = window.localStorage.getItem("user");
        setUserName(user);
    }, []);


    useEffect(() => {
        const getMyItems = () => {
            fetch(`${API_URL}/`, {
                method: "GET",
            })
                .then((res) => res.json())
                .then((data) => {
                    setMyItems(data.data);
                });
        };

        getMyItems();
    }, []);


    const handleChange = () => {
        setEditedBook({
            name: selectedBook.name,
            author: selectedBook.author,
            description: selectedBook.description,
            pages: selectedBook.pages,
            state: selectedBook.state,
            price: selectedBook.price,
            delivery: selectedBook.delivery,
            image: selectedBook.image,
        });

        setUpdate(true);
    }


    useEffect(() => {
        if (
            userName !== "" &&
            userName !== undefined &&
            userName !== null &&
            userName !== " " &&
            myItems !== []
        ) {
            if (!isFiltered || filteredItems.length === 0) {
                const filteredItems = myItems.filter((item) => item.uname === userName);
                console.log(filteredItems, "filtered");
                setFilteredItems(filteredItems);
                setIsFiltered(true);
            }
        }
    }, [userName, myItems, isFiltered]);


    const handleBookClick = (book) => {
        setSelectedBook(book);
    };


    const handleBackButtonClick = () => {
        setSelectedBook("");
        window.location.href = "./moje-inzeraty";
    }


    const handleDeleteButtonClick = () => {
        const bookId = selectedBook._id;

        fetch(`${API_URL}/moje-inzeraty/${bookId}`, {
            method: "DELETE",
            body: JSON.stringify({
                bookId: bookId,
            }),
        })
            .then((res) => res.json())
            .then((data) => {
                if (data.status === "ok") {
                    alert("Kniha byla smazána.");
                } else {
                    alert("Knyhu se nepodařilo smazat.");
                }
            })
            .catch((error) => {
                console.error("Error:", error);
                alert("Error.");
            });
    };


    return (
        <div id="books">
            {selectedBook == ""
                ? <BookList
                    books={filteredItems}
                    onBookClick={handleBookClick}
                />

                : update

                    ? <div className="logged-in">
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

                    : <div>

                        <BookDetail book={selectedBook} />
                        <div className="my-items-btn">
                            <button className="btn" onClick={handleBackButtonClick}>Zpět k prohlížení</button>
                            <button type="submit" className="btn" onClick={handleDeleteButtonClick}>
                                Smazat inzerát
                            </button>
                            <button className="btn" onClick={handleChange}>Upravit inzerát</button>
                        </div>
                    </div>
            }
        </div>
    );
}

export default MyItems;