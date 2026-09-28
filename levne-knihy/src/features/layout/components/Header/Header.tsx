import "./Header.css";

import { NavLink } from "react-router-dom";

import { ROUTE_PATHS } from "@/routes/paths";
import { LogoBadge } from "@/ui";

import SearchBar from "./SearchBar";

/** Horní lišta aplikace: logo a vyhledávání modelů. */
function Header() {
    return (
        <header className="header">
            <div className="header__container">

                <NavLink to={ROUTE_PATHS.home} className="header__brand">
                    
                    <LogoBadge />

                    <span className="header__brand-text">
                        <span className="header__title">AI Modely</span>

                        <span className="header__subtitle">
                            Prohlížení AI modelů z Hugging Face
                        </span>
                    </span>
                </NavLink>

                <div className="header__main">
                    <SearchBar />
                </div>
            </div>
        </header>
    );
}

export default Header;
