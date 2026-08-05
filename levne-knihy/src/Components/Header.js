import '../App.css';
import React, { useState, useEffect } from 'react';
import { NavLink } from "react-router-dom";





function Header({ }) {
  const [userData, setUserData] = useState("");



  useEffect(() => {
    fetch("http://localhost:5000/", {
      method: "POST",
      crossDomain: true,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "Access-Control-Allow-Origin": "*",
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