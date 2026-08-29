import { useState } from "react";
import { toast } from "react-toastify";

import {
    registerUser,
} from "../../../api/userApi";

import {
    UserFormData,
} from "../types";


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

            await registerUser({
                uname: formData.uname ?? "",
                fname: formData.fname,
                lname: formData.lname,
                phone: formData.phone,
                email: formData.email,
                password: formData.password ?? "",
            });
        
            setFormData(emptySignUp);

            toast.success("Registrace byla úspěšná.");

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
