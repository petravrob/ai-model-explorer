import "./Header.css";

import { NavLink } from "react-router-dom";

import { ROUTE_PATHS } from "@/routes/paths";
import { UserDropdown, useCurrentUser, useLogout } from "@/features/user";
import { Icon, LinkButton, ROBOT_ICON, USER_ICON } from "@/ui";

import SearchBar from "./SearchBar";

/** Horní lišta aplikace: logo, vyhledávání modelů a přihlášení nebo účet uživatele. */
function Header() {
    const { user } = useCurrentUser();
    const { logout } = useLogout();

    return (
        <header className="header">
            <div className="header__container">

                <NavLink to={ROUTE_PATHS.home} className="header__brand">
                    
                    <span className="header__logo">
                        <Icon path={ROBOT_ICON} className="header__logo-icon" />
                    </span>

                    <span className="header__brand-text">
                        <span className="header__title">AI Modely</span>

                        <span className="header__subtitle">
                            Prohlížení AI modelů z Hugging Face
                        </span>
                    </span>
                </NavLink>

                <div className="header__main">
                    <SearchBar />

                    {!user ? (
                        <div className="header__auth">
                            <NavLink to={ROUTE_PATHS.login} className="header__login">
                                <Icon path={USER_ICON} className="header__login-icon" />

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
            </div>
        </header>
    );
}

export default Header;
