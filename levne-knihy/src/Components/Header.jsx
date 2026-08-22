import '../App.css';
import React, { useState, useEffect } from 'react';
import { NavLink } from "react-router-dom";
import { API_URL } from "../config.js";





function Header({ }) {
  const [userData, setUserData] = useState("");



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
        setUserData(data.data);
      });
  }, []);


  const logOut = () => {
    window.localStorage.clear();
    window.location.href = "./";

  }

  const handleMyItemsClick = () => {
    window.location.href = "./moje-inzeraty";
  }

  const handleBooksClick = () => {
    window.location.href = "./";
  }

  let isLoggedIn;
  try {
    isLoggedIn = userData.uname
  } catch { isLoggedIn = false };

  

  return (
    <header>
      <div id="header">
        <div className='logo'>
          <h1>Levneknihy.cz</h1>
        </div>
        {!isLoggedIn
          ?
          <nav>
            <ul id='nav-bar'>
              <div className='nav-bar-div'>
              <li>
                <NavLink
                  to="/" onClick={handleBooksClick} >Knihy</NavLink>
              </li>
              <li>
                <NavLink to="/pridat-inzerat" >Přidat inzerát</NavLink>
              </li>
              </div>
              <div className='nav-bar-div'>
              <li>
                <NavLink to="/prihlasit-se">Přihlásit se</NavLink>
              </li>
              <li>
                <NavLink to="/registrovat-se">Registrovat se</NavLink>
              </li>
              </div>
            </ul>
          </nav>
          :
          <nav>
            <ul id='nav-bar'>
            <div className='nav-bar-div'>
              <li>
                <NavLink
                  to="/" onClick={handleBooksClick} >Knihy</NavLink>
              </li>
              <li>
                <NavLink to="/pridat-inzerat">Přidat inzerát</NavLink>
              </li>
              <li>
                <NavLink to="/moje-inzeraty" onClick={handleMyItemsClick}>Moje inzeráty</NavLink>
              </li>
              </div>
              <div className='nav-bar-div'>
              <li>
                <NavLink to="/uzivatel">{userData.uname}</NavLink>
              </li>
              <li>
                <button onClick={logOut}>Odhlásit se</button>
              </li>
              </div>
            </ul>
          </nav>
        }
      </div>
    </header>
  );
}

export default Header;