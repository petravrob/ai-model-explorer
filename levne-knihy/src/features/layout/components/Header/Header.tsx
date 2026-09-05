import "./Header.css";

import { NavLink } from "react-router-dom";

import { ROUTE_PATHS } from "@/routes/paths";
import { UserDropdown, useCurrentUser, useLogout } from "@/features/user";
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
                                Knihy
                            </NavLink>
                        </li>

                        <li>
                            <NavLink to={ROUTE_PATHS.addAdvertisement}>
                                Přidat inzerát
                            </NavLink>
                        </li>

                        {user && (
                            <li>
                                <NavLink to={ROUTE_PATHS.myAdvertisements}>
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
