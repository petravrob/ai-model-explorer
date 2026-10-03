import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import { UserFormData } from "../types";
import { registerUser } from "../api/userApi";
import { useAuthContext } from "../context/AuthContext";
import { ROUTE_PATHS } from "@/routes/paths";


const emptySignUp: UserFormData = {
    uname: "",
    fname: "",
    lname: "",
    phone: "",
    email: "",
    password: "",
};


/** Umožňuje registraci uživatele */
function useSignUp() {

    const [formData, setFormData] =
        useState<UserFormData>(emptySignUp);

    const navigate = useNavigate();

    const { login } = useAuthContext();

    // Obstará změnu polí v registrovacím formuláři
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

    // Zajišťuje registraci nového uživatele
    const handleSubmit = async (
        e: React.FormEvent<HTMLFormElement>
    ): Promise<void> => {

        e.preventDefault();

        try {

            const token = await registerUser({
                uname: formData.uname ?? "",
                fname: formData.fname,
                lname: formData.lname,
                phone: formData.phone,
                email: formData.email,
                password: formData.password ?? "",
            });

            // Po registraci je uživatel rovnou přihlášen
            login(token);

            toast.success("Registrace byla úspěšná.");

            // Přechod na hlavní stránku
            navigate(ROUTE_PATHS.home);

        } catch (error) {

            console.error(
                "Chyba při registraci:",
                error
            );

            const errorMessage =
                error instanceof Error
                    ? error.message
                    : "Registrace nebyla úspěšná.";

            toast.error(errorMessage);
        }

    };


    return {
        formData,
        handleChange,
        handleSubmit,
    };
}


export default useSignUp;

