import "../../App.css";
import React, { useEffect, useState } from "react";
import { API_URL } from "../../config.js";


function MyItems() {
    const [myItems, setMyItems] = useState([]);
    const [userName, setUserName] = useState("");
    const [filteredItems, setFilteredItems] = useState([]);
    const [isFiltered, setIsFiltered] = useState(false);
    const [selectedBook, setSelectedBook] = useState("");
    const [name, setName] = useState("");
    const [author, setAuthor] = useState("");
    const [description, setDescription] = useState("");
    const [pages, setPages] = useState("");
    const [state, setState] = useState("");
    const [price, setPrice] = useState("");
    const [delivery, setDelivery] = useState("");
    const [image, setImage] = useState("");
    const [uname, setUname] = useState("");
    const [update, setUpdate] = useState(false);
    const [fname, setFname] = useState("");
    const [lname, setLname] = useState("");
    const [phone, setPhone] = useState("");
    const [email, setEmail] = useState("");
    const [_id, setId] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();
        const bookId = selectedBook._id;
        console.log(bookId);
        fetch(`${API_URL}/moje-inzeraty/${bookId}`, {
            method: "POST",
            crossDomain: true,
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
            },
            body: JSON.stringify({
                name: selectedBook.name,
                author: selectedBook.author,
                description: selectedBook.description,
                pages: selectedBook.pages,
                state: selectedBook.state,
                price: selectedBook.price,
                delivery: selectedBook.delivery,
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
        console.log(
            name,
            author,
            description,
            pages,
            state,
            price,
            delivery,
            image, "what iam passing")
        setUpdate(false);

    }


    const convertToBase64 = (e) => {
        var reader = new FileReader();
        reader.readAsDataURL(e.target.files[0]);
        reader.onload = () => {
            setImage(reader.result);
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
        console.log(bookId);
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
            {selectedBook == "" ?
                <ul>
                    {filteredItems.map(book => {
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
                update ?
                    <div className="logged-in">
                        <h2>Upravit inzerát</h2>
                        <form action="/save-book" method="POST">
                            <div className="logged-in-left">
                                <div>
                                    <label name="name">Název:</label>
                                    <input type="text" id="name" name="name" value={selectedBook.name} required onChange={(e) => setSelectedBook({ ...selectedBook, name: e.target.value })} />
                                </div>

                                <div>
                                    <label name="author">Autor:</label>
                                    <input type="text" id="author" name="author" value={selectedBook.author} required onChange={(e) => setSelectedBook({ ...selectedBook, author: e.target.value })} />
                                </div>

                                <div>
                                    <label name="description">Popis:</label>
                                    <textarea id="description" name="description" value={selectedBook.description} onChange={(e) => setSelectedBook({ ...selectedBook, description: e.target.value })} ></textarea>
                                </div>
                            </div>
                            <div className="logged-in-right">
                                <div>
                                    <label name="pages">Počet stránek:</label>
                                    <input type="number" id="pages" name="pages" value={selectedBook.pages} required onChange={(e) => setSelectedBook({ ...selectedBook, pages: e.target.value })} />
                                </div>

                                <div>
                                    <label name="state">Stav knihy:</label>
                                    <div id="state">
                                        <div className="book-state">
                                            <input type="radio" id="state-new" name="state" value="nová" required checked={selectedBook.state === "nová"} onChange={(e) => setSelectedBook({ ...selectedBook, state: e.target.value })} />
                                            <label name="state-new">Nová</label>
                                        </div>
                                        <div className="book-state">
                                            <input type="radio" id="state-excellent" name="state" value="velmi dobrý" checked={selectedBook.state === "velmi dobrý"} onChange={(e) => setSelectedBook({ ...selectedBook, state: e.target.value })} />
                                            <label name="state-excellent">Velmi dobrý</label>
                                        </div>
                                        <div className="book-state">
                                            <input type="radio" id="state-good" name="state" value="dobrý" checked={selectedBook.state === "dobrý"} onChange={(e) => setSelectedBook({ ...selectedBook, state: e.target.value })} />
                                            <label name="state-good">Dobrý</label>
                                        </div>
                                        <div className="book-state">
                                            <input type="radio" id="state-poor" name="state" value="horší stav" checked={selectedBook.state === "horší stav"} onChange={(e) => setSelectedBook({ ...selectedBook, state: e.target.value })} />
                                            <label name="state-poor">Horší stav</label>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <label name="price">Cena:</label>
                                    <input type="number" id="price" name="price" value={selectedBook.price} required onChange={(e) => setSelectedBook({ ...selectedBook, price: e.target.value })} />
                                </div>

                                <div>
                                    <label name="delivery">Poštovné:</label>
                                    <input type="number" id="delivery" name="delivery" value={selectedBook.delivery} required onChange={(e) => setSelectedBook({ ...selectedBook, delivery: e.target.value })} />
                                </div>
                                <button className="btn" onClick={handleSubmit} type="submit">Uložit úpravy</button>
                            </div>
                        </form>
                    </div>
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