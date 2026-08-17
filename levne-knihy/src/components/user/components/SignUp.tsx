import useSignUp from "../hooks/useSignUp";

import UserForm from "./UserForm";

/** Registrace uživatele. */
function SignUp() {

    const {
        formData,
        handleChange,
        handleSubmit,
    } = useSignUp();


    return (
        <UserForm
            title="Registrovat se"
            formData={formData}
            handleChange={handleChange}
            handleSubmit={handleSubmit}
            submitText="Registrovat se"
            showUsername
            showPassword
        />
    );
}


export default SignUp;
