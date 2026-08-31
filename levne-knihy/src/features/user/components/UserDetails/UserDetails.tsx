import "./UserDetails.css";

import { UserDetailsProps } from "../../types";

/** Zobrazuje základní informace o uživateli. */
function UserDetails({ user, onEdit }: UserDetailsProps) {
    return (
        <div className="user-details">
            <div className="user-details__header">
                <div className="user-details__avatar" aria-hidden="true"></div>

                <div>
                    <h2>{user.fname} {user.lname}</h2>
                    <p>@{user.uname}</p>
                </div>
            </div>

            <div className="user-details__info">
                <div>
                    <span>Email</span>
                    <strong>{user.email}</strong>
                </div>

                <div>
                    <span>Telefon</span>
                    <strong>{user.phone}</strong>
                </div>
            </div>

            <button
                type="button"
                onClick={onEdit}
            >
                Upravit osobní údaje
            </button>
        </div>
    );
}

export default UserDetails;
