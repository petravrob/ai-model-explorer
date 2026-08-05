import "../App.css"
import React, { Component, useState } from "react";

function LogIn() {
  const [uname, setUname] = useState("");
  const [password, setPassword] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    fetch("http://localhost:5000/prihlasit-se", {
      method: "POST",
      crossDomain: true,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        uname,
        password,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.status == "ok") {
          alert("Přihlášení bylo úspěšné.");
          window.localStorage.setItem("token", data.data);
          window.localStorage.setItem("loggedIn", true);
          window.localStorage.setItem("user", uname);

          window.location.href = "./";
        }
      }); fetch("http://localhost:5000/", {
        method: "POST",
        crossDomain: true,
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify({
          uname,
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.status == "ok") {
            window.localStorage.setItem("user", uname);
          }
        });
  }

  return (
    <div className="auth-wrapper">
      <div className="auth-inner">
        <form onSubmit={handleSubmit}>
          <h2>Přihlásit se</h2>

          <div className="mb-3">
            <label>Přezdívka</label>
            <input
              type="text"
              className="form-control"
              onChange={(e) => setUname(e.target.value)}
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
              Přihlásit se
            </button>
          </div>
          {/* <p className="forgot-password text-right">
            <a href="/sign-up">Sign Up</a>
          </p> */}
        </form>
      </div>
    </div>
  );
}

export default LogIn;