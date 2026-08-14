import "../../App.css"
import { API_URL } from "../../config.js";


import React, { useState } from "react";

function SignUp() {
    const [uname, setUname] = useState("");
    const [fname, setFname] = useState("");
    const [lname, setLname] = useState("");
    const [phone, setPhone] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleSubmit = (e) => {
            e.preventDefault();

            fetch(`${API_URL}/registrovat-se`, {
                method: "POST",
                crossDomain: true,
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
                body: JSON.stringify({
                    uname,
                    fname,
                    lname,
                    email,
                    phone,
                    password,
                }),
            })
                .then((res) => res.json())
                .then((data) => {
                    if (data.status == "ok") {
                        alert("Registrace byla úspěšná.");
                    } else {
                        alert("Error");
                    }
                });
        }

    return (
        <div className="auth-wrapper">
            <div className="auth-inner">
                <form onSubmit={handleSubmit}>
                    <h2>Registrovat se</h2>
                    <div className="mb-3">
                        <label>Přezdívka</label>
                        <input
                            type="text"
                            className="form-control"
                            onChange={(e) => setUname(e.target.value)}
                        />
                    </div>

                    <div className="mb-3">
                        <label>Jméno</label>
                        <input
                            type="text"
                            className="form-control"
                            onChange={(e) => setFname(e.target.value)}
                        />
                    </div>

                    <div className="mb-3">
                        <label>Příjmení</label>
                        <input
                            type="text"
                            className="form-control"
                            onChange={(e) => setLname(e.target.value)}
                        />
                    </div>

                    <div className="mb-3">
                        <label>Email</label>
                        <input
                            type="email"
                            className="form-control"
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <div className="mb-3">
                        <label>Telefon</label>
                        <input
                            type="text"
                            className="form-control"
                            onChange={(e) => setPhone(e.target.value)}
                        />
                    </div>

                    <div className="mb-3">
                        <label>Heslo</label>
                        <input
                            type="password"
                            className="form-control"
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    <div className="d-grid">
                        <button type="submit" className="btn btn-primary">
                            Registrovat se
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
export default SignUp;