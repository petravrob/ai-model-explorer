import { UserDetailsProps } from "../types";

/** Zobrazuje detailní informace o uživateli. */
function UserDetails({
    user,
    onEdit,
}: UserDetailsProps) {

    return (
        <div id="user">

            <p className="user-detail-text">
                Přezdívka:
                <br />
                <b>{user.uname}</b>
            </p>

            <p className="user-detail-text">
                Jméno:
                <br />
                <b>{user.fname}</b>
            </p>

            <p className="user-detail-text">
                Příjmení:
                <br />
                <b>{user.lname}</b>
            </p>

            <p className="user-detail-text">
                Telefon:
                <br />
                <b>{user.phone}</b>
            </p>

            <p className="user-detail-text">
                Email:
                <br />
                <b>{user.email}</b>
            </p>

            <button
                type="button"
                className="btn"
                onClick={onEdit}
            >
                Upravit osobní údaje
            </button>

        </div>
    );
}


export default UserDetails;