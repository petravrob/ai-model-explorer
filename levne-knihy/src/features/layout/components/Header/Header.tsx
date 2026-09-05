import "./Header.css";

import { NavLink } from "react-router-dom";

import { UserDropdown, useCurrentUser } from "@/features/user";
import useLogout from "@/features/user/api/userApi";
import { LinkButton } from "@/ui";

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
                            <NavLink to="/prihlasit-se" className="header__login">
                                Přihlásit se
                            </NavLink>

                            <LinkButton to="/registrovat-se">
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
