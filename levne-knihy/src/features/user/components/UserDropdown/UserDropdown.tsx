import "./UserDropdown.css";

import { useEffect, useRef, useState } from "react";
import { NavLink } from "react-router-dom";
import Avatar from "../../../../ui/Avatar/Avatar";

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
                <Avatar />

                <span>{uname}</span>

                <span
                    className="user-dropdown__chevron"
                    aria-hidden="true"
                ></span>
            </button>

            {open && (
                <div className="user-dropdown__menu">
                    <div className="user-dropdown__header">
                        <Avatar size="large" />

                        <span>{displayName}</span>
                    </div>

                    <div className="user-dropdown__divider"></div>

                    <NavLink
                        to="/uzivatel"
                        className="user-dropdown__item"
                        onClick={() => setOpen(false)}
                    >
                        <span
                            className="user-dropdown__icon"
                            aria-hidden="true"
                        ></span>
                        Profil
                    </NavLink>

                    <div className="user-dropdown__divider"></div>

                    <button
                        type="button"
                        className="user-dropdown__item user-dropdown__item--logout"
                        onClick={() => {
                            setOpen(false);
                            onLogout();
                        }}
                    >
                        <span
                            className="user-dropdown__icon"
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
