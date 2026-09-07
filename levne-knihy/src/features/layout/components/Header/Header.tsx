import "./Header.css";

import { NavLink } from "react-router-dom";

import { ROUTE_PATHS } from "@/routes/paths";
import { UserDropdown, useCurrentUser, useLogout } from "@/features/user";
import { LinkButton } from "@/ui";

import SearchBar from "./SearchBar";

/** Hlavička aplikace – logo, vyhledávání modelů a přihlášení/účet uživatele. */
function Header() {
    const { user } = useCurrentUser();
    const { logout } = useLogout();

    return (
        <header className="header">
            <div className="header__container">
                <div className="header__top">
                    <NavLink
                        to={ROUTE_PATHS.home}
                        className="header__brand"
                    >
                        <h1>AI Modely</h1>
                    </NavLink>

                    <SearchBar />

                    {!user ? (
                        <div className="header__auth">
                            <NavLink to={ROUTE_PATHS.login} className="header__login">
                                Přihlásit se
                            </NavLink>

                            <LinkButton to={ROUTE_PATHS.signUp}>
                                Registrovat se
                            </LinkButton>
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
                            <NavLink to={ROUTE_PATHS.home} end>
                                Modely
                            </NavLink>
                        </li>
                    </ul>
                </nav>
            </div>
        </header>
    );
}

export default Header;
