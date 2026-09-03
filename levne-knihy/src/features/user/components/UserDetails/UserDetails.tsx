import { UserDetailsProps } from "../../types";
import { Avatar, Button } from "@/ui";
import "./UserDetails.css";

/** Zobrazuje základní informace o uživateli. */
function UserDetails({ user, onEdit }: UserDetailsProps) {
    return (
        <div className="user-details">
            <div className="user-details__header">
                <Avatar size="large" />

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

            <Button onClick={onEdit}>
                Upravit osobní údaje
            </Button>
        </div>
    );
}

export default UserDetails;
