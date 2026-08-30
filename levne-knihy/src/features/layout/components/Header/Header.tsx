import "./Header.css";

import { NavLink } from "react-router-dom";

import useCurrentUser from "../../../user/hooks/useCurrentUser";
import useLogout from "../../../../api/userApi";

function Header() {

    const {
        user,
    } = useCurrentUser();

    const {
        logout,
    } = useLogout();


    return (
        <header>

            <div id="header">

                <div className="logo">

                    <h1>
                        Levneknihy.cz
                    </h1>

                </div>


                <nav>

                    <ul id="nav-bar">

                        <div className="nav-bar-div">

                            <li>
                                <NavLink to="/">
                                    Knihy
                                </NavLink>
                            </li>

                            <li>
                                <NavLink to="/pridat-inzerat">
                                    Přidat inzerát
                                </NavLink>
                            </li>

                            {user && (
                                <li>
                                    <NavLink to="/moje-inzeraty">
                                        Moje inzeráty
                                    </NavLink>
                                </li>
                            )}

                        </div>


                        <div className="nav-bar-div">

                            {!user ? (
                                <>
                                    <li>
                                        <NavLink to="/prihlasit-se">
                                            Přihlásit se
                                        </NavLink>
                                    </li>

                                    <li>
                                        <NavLink to="/registrovat-se">
                                            Registrovat se
                                        </NavLink>
                                    </li>
                                </>
                            ) : (
                                <>
                                    <li>
                                        <NavLink to="/uzivatel">
                                            {user.uname}
                                        </NavLink>
                                    </li>

                                    <li>
                                        <button
                                            type="button"
                                            onClick={logout}
                                        >
                                            Odhlásit se
                                        </button>
                                    </li>
                                </>
                            )}

                        </div>

                    </ul>

                </nav>

            </div>

        </header>
    );
}


export default Header;
