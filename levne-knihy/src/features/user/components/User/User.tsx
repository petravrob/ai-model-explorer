import "./User.css";

import useUser from "../../hooks/useUser";

import UserDetails from "../UserDetails/UserDetails";
import UserForm from "../UserForm/UserForm";

/** Zobrazuje údaje uživatele a umožňuje jejich upravení. */
function User() {

    const {
        user,
        update,
        formData,

        handleChange,
        handleEdit,
        handleSubmit,

        loading,
        error,
    } = useUser();


    if (loading) {

        return (
            <div className="user">
                <p className="user__message">Načítání údajů...</p>
            </div>
        );
    }

    if (error || !user) {
        return (
            <div className="user">
                <p className="user__message">
                    {error ?? "Nepodařilo se načíst uživatele."}
                </p>
            </div>
        );
    }

    if (update) {
        return (
            <div className="user">
                <UserForm
                    formData={formData}
                    handleChange={handleChange}
                    handleSubmit={handleSubmit}
                    submitText="Upravit osobní údaje"
                />
            </div>
        );
    }

    return (
        <div className="user">
            <UserDetails
                user={user}
                onEdit={handleEdit}
            />
        </div>
    );
}

export default User;
