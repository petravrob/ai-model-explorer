import { useEffect, useRef, useState } from "react";
import { NavLink } from "react-router-dom";

import "./UserDropdown.css";

interface UserDropdownProps {
    uname: string;
    fname?: string;
    lname?: string;
    onLogout: () => void;
}

function UserDropdown({
    uname,
    fname,
    lname,
    onLogout,
}: UserDropdownProps) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);
    const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    const displayName = [fname, lname].filter(Boolean).join(" ") || uname;

    function openMenu() {
        if (closeTimer.current) {
            clearTimeout(closeTimer.current);
            closeTimer.current = null;
        }

        setOpen(true);
    }

    function toggleMenu() {
        if (closeTimer.current) {
            clearTimeout(closeTimer.current);
            closeTimer.current = null;
        }

        setOpen((current) => !current);
    }

    function scheduleClose() {
        if (closeTimer.current) {
            clearTimeout(closeTimer.current);
        }

        closeTimer.current = setTimeout(() => {
            setOpen(false);
        }, 150);
    }

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (
                ref.current &&
                !ref.current.contains(event.target as Node)
            ) {
                setOpen(false);
            }
        }

        document.addEventListener("click", handleClickOutside);

        return () => {
            document.removeEventListener("click", handleClickOutside);

            if (closeTimer.current) {
                clearTimeout(closeTimer.current);
            }
        };
    }, []);

    return (
        <div
            className={`user-dropdown ${open ? "is-open" : ""}`}
            ref={ref}
            onMouseEnter={openMenu}
            onMouseLeave={scheduleClose}
        >
            <button
                type="button"
                className="user-dropdown__trigger"
                aria-expanded={open}
                aria-haspopup="true"
                onClick={toggleMenu}
            >
                <span
                    className="user-dropdown__avatar"
                    aria-hidden="true"
                ></span>

                <span>{uname}</span>

                <span
                    className="user-dropdown__chevron"
                    aria-hidden="true"
                ></span>
            </button>

            {open && (
                <div className="user-dropdown__menu">
                    <div className="user-dropdown__header">
                        <span
                            className="user-dropdown__avatar large"
                            aria-hidden="true"
                        ></span>

                        <span>{displayName}</span>
                    </div>

                    <div className="divider"></div>

                    <NavLink
                        to="/uzivatel"
                        className="item"
                        onClick={() => setOpen(false)}
                    >
                        <span
                            className="icon profile"
                            aria-hidden="true"
                        ></span>
                        Profil
                    </NavLink>

                    <div className="divider"></div>

                    <button
                        type="button"
                        className="item logout"
                        onClick={() => {
                            setOpen(false);
                            onLogout();
                        }}
                    >
                        <span
                            className="icon logout-icon"
                            aria-hidden="true"
                        ></span>
                        Odhlásit se
                    </button>
                </div>
            )}
        </div>
    );
}

export default UserDropdown;
