import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import { LoginData } from "../types";
import { loginUser } from "../api/userApi";
import { useAuthContext } from "../context/AuthContext";
import { AuthRedirectState, ROUTE_PATHS } from "@/routes/paths";


const emptyLogin: LoginData = {
    uname: "",
    password: "",
};

/** Umožňuje přihlášení uživatele */
function useLogIn() {

    const [formData, setFormData] =
        useState<LoginData>(emptyLogin);

    const navigate = useNavigate();

    const location = useLocation();

    const { login } = useAuthContext();

    // Stránka, ze které byl uživatel na přihlášení přesměrován
    const from =
        (location.state as AuthRedirectState | null)?.from?.pathname
        ?? ROUTE_PATHS.home;

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

            const token = await loginUser(formData);

            login(token);

            toast.success("Přihlášení bylo úspěšné.");

            // Návrat na stránku, ze které přišel uživatel
            navigate(from, { replace: true });

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

