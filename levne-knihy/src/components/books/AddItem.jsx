import "../../App.css";
import React, { useEffect, useState } from "react";
import { API_URL } from "../../config.js";


function AddItem() {
    const [name, setName] = useState("");
    const [author, setAuthor] = useState("");
    const [description, setDescription] = useState("");
    const [pages, setPages] = useState("");
    const [state, setState] = useState("");
    const [price, setPrice] = useState("");
    const [delivery, setDelivery] = useState("");
    const [image, setImage] = useState("");
    const [fname, setFname] = useState("");
    const [lname, setLname] = useState("");
    const [phone, setPhone] = useState("");
    const [userName, setUserName] = useState("");


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

    const handleSubmit = (e) => {
        e.preventDefault();
        fetch(`${API_URL}/pridat-inzerat`, {
            method: "POST",
            crossDomain: true,
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
            },
            body: JSON.stringify({
                uname: userName,
                name,
                author,
                description,
                pages,
                price,
                state,
                delivery,
                fname,
                lname,
                phone,
                base64: image
            }),
        })
            .then((res) => res.json())
            .then((data) => {
                if (data.status == "ok") {
                    alert("Kniha byla přidána");
                } else {
                    alert("Error");
                }
            });
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
                setUserName(data.data.uname);
                setFname(data.data.fname);
                setLname(data.data.lname);
                setPhone(data.data.phone);
                console.log(userName, "username")
            });
    }, []);

    return (
        <div id="add-item">
            {!userName ? <h4>Do této sekce mohou přispívat pouze přihlášení uživatelé.</h4>
                :

                <div className="logged-in">
                    <h2>Přidat inzerát</h2>
                    <form action="/save-book" method="POST">
                        <div className="logged-in-left">
                            <div>
                                <label name="name">Název:</label>
                                <input type="text" id="name" name="name" required onChange={(e) => setName(e.target.value)} />
                            </div>

                            <div>
                                <label name="author">Autor:</label>
                                <input type="text" id="author" name="author" required onChange={(e) => setAuthor(e.target.value)} />
                            </div>

                            <div>
                                <label name="description">Popis:</label>
                                <textarea id="description" name="description" onChange={(e) => setDescription(e.target.value)}></textarea>
                            </div>
                        </div>
                        <div className="logged-in-right">
                            <div>
                                <label name="pages">Počet stránek:</label>
                                <input type="number" id="pages" name="pages" required onChange={(e) => setPages(e.target.value)} />
                            </div>

                            <div>
                                <label name="state">Stav knihy:</label>
                                <div id="state">
                                    <div className="book-state">
                                        <input type="radio" id="state-new" name="state" value="nová" required onChange={(e) => setState(e.target.value)} />
                                        <label name="state-new">Nová</label>
                                    </div>
                                    <div className="book-state">
                                        <input type="radio" id="state-excellent" name="state" value="velmi dobrý" onChange={(e) => setState(e.target.value)} />
                                        <label name="state-excellent">Velmi dobrý</label>
                                    </div>
                                    <div className="book-state">
                                        <input type="radio" id="state-good" name="state" value="dobrý" onChange={(e) => setState(e.target.value)} />
                                        <label name="state-good">Dobrý</label>
                                    </div>
                                    <div className="book-state">
                                        <input type="radio" id="state-poor" name="state" value="horší stav" onChange={(e) => setState(e.target.value)} />
                                        <label name="state-poor">Horší stav</label>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <label name="price">Cena:</label>
                                <input type="number" id="price" name="price" required onChange={(e) => setPrice(e.target.value)} />
                            </div>

                            <div>
                                <label name="delivery">Poštovné:</label>
                                <input type="number" id="delivery" name="delivery" required onChange={(e) => setDelivery(e.target.value)} />
                            </div>

                            <div>
                                <label name="image">Obrázek:</label>
                                <input type="file" id="image" name="image" accept="image/*" required onChange={convertToBase64} />
                            </div>
                            <button className="btn" onClick={handleSubmit} type="submit">Uložit knihu</button>
                        </div>
                    </form>
                </div>

            }
        </div >
    )
}

export default AddItem;