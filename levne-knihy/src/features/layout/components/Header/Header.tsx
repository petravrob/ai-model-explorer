import "./Header.css";

import { NavLink } from "react-router-dom";

import useCurrentUser from "../../../user/hooks/useCurrentUser";
import useLogout from "../../../../api/userApi";
import UserDropdown from "../../../user/components/UserDropdown/UserDropdown";

function Header() {
    const { user } = useCurrentUser();
    const { logout } = useLogout();

    return (
        <header className="header">
            <div className="header__container">
                <div className="header__top">
                    <h1>Levneknihy</h1>

                    {!user ? (
                        <div className="header__auth">
                            <NavLink to="/prihlasit-se">
                                Přihlásit se
                            </NavLink>

                            <NavLink
                                to="/registrovat-se"
                                className="register"
                            >
                                Registrovat se
                            </NavLink>
                        </div>
                    ) : (
                        <UserDropdown
                            uname={user.uname}
                            fname={user.fname}
                            lname={user.lname}
                            onLogout={logout}
                        />
                    )}
                </div>

                <nav>
                    <ul>
                        <li>
                            <NavLink to="/" end>
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
                    </ul>
                </nav>
            </div>
        </header>
    );
}

export default Header;
