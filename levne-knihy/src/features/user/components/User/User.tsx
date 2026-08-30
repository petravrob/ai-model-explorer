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
            <div id="user">
                <p>Načítání údajů...</p>
            </div>
        );

    }


    if (error || !user) {

        return (
            <div id="user">
                <p>
                    {error ?? "Nepodařilo se načíst uživatele."}
                </p>
            </div>
        );

    }


    return (
        <div>

            {update ? (

                <UserForm
                    title="Upravit osobní údaje"
                    formData={formData}
                    handleChange={handleChange}
                    handleSubmit={handleSubmit}
                    submitText="Upravit"
                />

            ) : (

                <UserDetails
                    user={user}
                    onEdit={handleEdit}
                />

            )}

        </div>
    );
}


export default User;