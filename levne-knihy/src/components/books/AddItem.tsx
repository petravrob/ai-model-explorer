import React, { useEffect, useState } from "react";
import { API_URL } from "../../config.js";
import BookForm from "./BookForm.tsx";
import { BookFormData } from "./types";


function AddItem() {
    // TODO: zavést typ User
    const [userName, setUserName] = useState("");
    const [fname, setFname] = useState("");
    const [lname, setLname] = useState("");
    const [phone, setPhone] = useState("");

    const [newBook, setNewBook] = useState<BookFormData>({
        name: "",
        author: "",
        description: "",
        pages: "",
        state: "",
        price: "",
        delivery: "",
        image: "",
    });

    // Převod nahraného obrázku knihy, aby byl vyhovojící pro databázi
    const convertToBase64 = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];

        if (!file) {
            return;
        }

        const reader = new FileReader();

        reader.onload = () => {
            setNewBook((prev) => ({
                ...prev,
                image: reader.result as string,
            }));
        };

        reader.onerror = (error) => {
            console.error("Chyba při převodu obrázku:", error);
        };

        reader.readAsDataURL(file);
    };


    // Vytvoření nového inzerátu knihy
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        fetch(`${API_URL}/pridat-inzerat`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
            },
            body: JSON.stringify({
                uname: userName,
                name: newBook.name,
                author: newBook.author,
                description: newBook.description,
                pages: newBook.pages,
                price: newBook.price,
                state: newBook.state,
                delivery: newBook.delivery,
                fname,
                lname,
                phone,
                base64: newBook.image,
            }),
        })
            .then((res) => res.json())
            .then((data) => {
                if (data.status === "ok") {
                    alert("Kniha byla přidána");
                } else {
                    alert("Error");
                }
            });
    };


    // Získání dat o přihlášeném uživateli
    useEffect(() => {
        fetch(`${API_URL}/`, {
            method: "POST",
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
            });
    }, []);


    return (
        <div id="add-item">
            {!userName ? (
                <h4>
                    Do této sekce mohou přispívat pouze přihlášení uživatelé.
                </h4>
            ) : (
                <div className="logged-in">
                    <h2>Přidat inzerát</h2>

                    <BookForm
                        book={newBook}
                        setBook={setNewBook}
                        onSubmit={handleSubmit}
                        submitText="Uložit knihu"
                        showImage={true}
                        onImageChange={convertToBase64}
                    />
                </div>
            )}
        </div>
    );
}

export default AddItem;