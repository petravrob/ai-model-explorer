import { useState } from "react";

import {
    loginUser,
} from "../../../api/userApi";
import { LoginData } from "../types";


const emptyLogin: LoginData = {
    uname: "",
    password: "",
};

/** Umožňuje přihlášení uživatele */
function useLogIn() {

    const [formData, setFormData] =
        useState<LoginData>(emptyLogin);


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


    const handleSubmit = async (
        e: React.FormEvent<HTMLFormElement>
    ): Promise<void> => {

        e.preventDefault();

        try {

            const token = await loginUser(formData);

            alert("Přihlášení bylo úspěšné.");

            window.localStorage.setItem(
                "token",
                token
            );

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

            alert(
                "Přihlášení nebylo úspěšné."
            );

        }

    };


    return {
        formData,
        handleChange,
        handleSubmit,
    };
}


export default useLogIn;