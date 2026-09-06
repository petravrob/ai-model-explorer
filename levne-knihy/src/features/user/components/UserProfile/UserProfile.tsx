import useUser from "../../hooks/useUser";
import { PageContainer, PageMessage } from "@/ui";

import UserDetails from "../UserDetails/UserDetails";
import UserForm from "../UserForm/UserForm";

/** Zobrazuje údaje uživatele a umožňuje jejich upravení. */
function UserProfile() {

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
            <PageContainer>
                <PageMessage>Načítání údajů...</PageMessage>
            </PageContainer>
        );
    }

    if (error || !user) {
        return (
            <PageContainer>
                <PageMessage>
                    {error ?? "Nepodařilo se načíst uživatele."}
                </PageMessage>
            </PageContainer>
        );
    }

    if (update) {
        return (
            <PageContainer>
                <UserForm
                    formData={formData}
                    handleChange={handleChange}
                    handleSubmit={handleSubmit}
                    submitText="Upravit osobní údaje"
                />
            </PageContainer>
        );
    }

    return (
        <PageContainer>
            <UserDetails
                user={user}
                onEdit={handleEdit}
            />
        </PageContainer>
    );
}

export default UserProfile;

