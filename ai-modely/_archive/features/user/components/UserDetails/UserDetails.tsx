import { UserDetailsProps } from "../../types";
import { Avatar, Button, DetailItem } from "@/ui";
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
                <DetailItem label="Email" value={user.email} />
                <DetailItem label="Telefon" value={user.phone} />
            </div>

            <Button onClick={onEdit}>
                Upravit osobní údaje
            </Button>
        </div>
    );
}

export default UserDetails;