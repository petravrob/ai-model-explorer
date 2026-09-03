import useSignUp from "../../hooks/useSignUp";

import UserForm from "../UserForm/UserForm";
import { PageContainer, PageTitle } from "@/ui";

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
        </PageContainer>
    );
}


export default SignUp;