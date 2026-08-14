import "../App.css"
import { useState, useEffect } from "react";
import { API_URL } from "../config.js";


function User () {
    const [uname, setUname] = useState("");
    const [fname, setFname] = useState("");
    const [lname, setLname] = useState("");
    const [phone, setPhone] = useState("");
    const [email, setEmail] = useState("");
    const [_id, setId] = useState("");

    const [update, setUpdate] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();

        fetch(`${API_URL}/uzivatel`, {
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
                _id,
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
    useEffect(() => {
        fetch(`${API_URL}`, {
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

    const handleChange = () => {
        setUpdate(true);
    }
    return (
        <div>
        { update === false ?
            <div id="user">
                <p className="user-detail-text">
                    Přezdívka: <br /><b>{uname}</b>
                </p>
                <p className="user-detail-text">
                    Jméno: <br /><b>{fname}</b>
                </p>
                <p className="user-detail-text">
                    Příjmení: <br /><b>{lname}</b>
                </p>
                <p className="user-detail-text">
                    Telefon: <br /><b>{phone}</b>
                </p>
                <p className="user-detail-text">
                    Email: <br /><b>{email}</b>
                </p>
                <button className="btn" onClick={handleChange}>Upravit osobní údaje</button>
            </div>
            :
            <div className="auth-wrapper">
                <div className="auth-inner">
                    <form onSubmit={handleSubmit}>
                        <h2>Upravit osobní údaje</h2>
                        <div className="mb-3">
                            <label>Přezdívku nelze změnit</label>
                        </div>

                        <div className="mb-3">
                            <label>Jméno</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={fname}
                                    onChange={(e) => setFname(e.target.value)}
                                />
                            </div>

                            <div className="mb-3">
                                <label>Příjmení</label>
                                <input
                                    value={lname}
                                    type="text"
                                    className="form-control"
                                    onChange={(e) => setLname(e.target.value)}
                                />
                            </div>

                            <div className="mb-3">
                                <label>Email</label>
                                <input
                                    value={email}
                                    type="email"
                                    className="form-control"
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>

                            <div className="mb-3">
                                <label>Telefon</label>
                            <input
                                type="text"
                                value={phone}
                                className="form-control"
                                onChange={(e) => setPhone(e.target.value)}
                            />
                        </div>
                        <div className="d-grid">
                            <button type="submit" className="btn btn-primary" onClick={handleSubmit}>
                                Upravit
                            </button>
                        </div>
                    </form>
                </div>
            </div>
       }
       </div>
    )
}

export default User;