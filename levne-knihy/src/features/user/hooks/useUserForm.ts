import { useState } from "react";

import {
    User,
    UserFormData,
} from "../types";


const emptyUserForm: UserFormData = {
    fname: "",
    lname: "",
    phone: "",
    email: "",
};


/** Řeší stav formuláře uživatele */
function useUserForm() {

    const [formData, setFormData] =
        useState<UserFormData>(emptyUserForm);

    // Obstarává změnu formuláře o uživateli
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

    // Založí nového uživatele
    const initializeUser = (
        user: User
    ): void => {

        setFormData({
            fname: user.fname,
            lname: user.lname,
            phone: user.phone,
            email: user.email,
        });

    };


    const resetForm = (): void => {

        setFormData(emptyUserForm);

    };


    return {
        formData,

        handleChange,
        initializeUser,
        resetForm,
    };
}


export default useUserForm;
