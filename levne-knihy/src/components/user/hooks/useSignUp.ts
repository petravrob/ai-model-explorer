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

            await registerUser({
                uname: formData.uname ?? "",
                fname: formData.fname,
                lname: formData.lname,
                phone: formData.phone,
                email: formData.email,
                password: formData.password ?? "",
            });

            toast.success("Registrace byla úspěšná.");
        
            setFormData(emptySignUp);

        } catch (error) {

            console.error(
                "Chyba při registraci:",
                error
            );

            toast.error("Registrace nebyla úspěšná.");
        
        }

    };


    return {
        formData,
        handleChange,
        handleSubmit,
    };
}


export default useSignUp;
