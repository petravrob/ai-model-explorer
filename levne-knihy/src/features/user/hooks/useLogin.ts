import { useState } from "react";
import { toast } from "react-toastify";

import { LoginData } from "../types";
import { loginUser } from "../api/userApi";


const emptyLogin: LoginData = {
    uname: "",
    password: "",
};

/** Umožňuje přihlášení uživatele */
function useLogIn() {

    const [formData, setFormData] =
        useState<LoginData>(emptyLogin);

    // Obstará změnu polí v přihlašovacím formuláři
    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement>
    ): void => {

        const {
            name,
            value,
        } = e.target;

        setFormData((previousData) => ({
            ...previousData,
            [name]: value,
        }));

    };

    // Přihlášení uživatele
    const handleSubmit = async (
        e: React.FormEvent<HTMLFormElement>
    ): Promise<void> => {

        e.preventDefault();

        try {

            const response = await loginUser(formData);
        
            localStorage.setItem("token", response);

            window.localStorage.setItem(
                "loggedIn",
                "true"
            );

            window.localStorage.setItem(
                "user",
                formData.uname
            );

            window.location.href = "./";

        } catch (error) {

            console.error(
                "Chyba při přihlášení:",
                error
            );

            const errorMessage =
                error instanceof Error
                    ? error.message
                    : "Přihlášení nebylo úspěšné.";

            toast.error(errorMessage);
        }

    };


    return {
        formData,
        handleChange,
        handleSubmit,
    };
}


export default useLogIn;