import useSignUp from "../../hooks/useSignUp";

import UserForm from "../UserForm/UserForm";
import { LinkButton, PageContainer, PageMessage, PageTitle } from "@/ui";
import { ROUTE_PATHS } from "@/routes/paths";

/** Registrace uživatele. */
function SignUp() {

    const {
        formData,
        handleChange,
        handleSubmit,
    } = useSignUp();


    return (
        <PageContainer>
            <PageTitle centered>Registrovat se</PageTitle>

            <UserForm
                formData={formData}
                handleChange={handleChange}
                handleSubmit={handleSubmit}
                submitText="Registrovat se"
                showUsername
                showPassword
            />

            <PageMessage>
                Již máte účet?{" "}
                <LinkButton to={ROUTE_PATHS.login}>Přihlásit se</LinkButton>
            </PageMessage>
        </PageContainer>
    );
}


export default SignUp;

