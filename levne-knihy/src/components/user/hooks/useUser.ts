import { useState } from "react";
import { toast } from "react-toastify";

import {
    updateUser,
} from "../../../api/userApi";

import useCurrentUser from "./useCurrentUser";
import useUserForm from "./useUserForm";


/** Umožňuje úpravu uživatele */
function useUser() {

    const {
        user,
        loading,
        error,
    } = useCurrentUser();


    const {
        formData,
        handleChange,
        initializeUser,
    } = useUserForm();


    const [update, setUpdate] =
        useState<boolean>(false);


    const handleEdit = (): void => {

        if (!user) {
            return;
        }

        initializeUser(user);

        setUpdate(true);

    };


    const handleSubmit = async (
        e: React.FormEvent<HTMLFormElement>
    ): Promise<void> => {

        e.preventDefault();

        if (!user) {
            return;
        }

        try {

            const updatedUser = {
                ...user,
                ...formData,
            };

            await updateUser(updatedUser);

            toast.success("Údaje byly upraveny.");
        
            setUpdate(false);

        } catch (error) {

            console.error(
                "Chyba při úpravě osobních údajů:",
                error
            );

            toast.error("Údaje se nepodařilo upravit.");
        
        }

    };


    return {
        user,
        update,
        formData,

        handleChange,
        handleEdit,
        handleSubmit,

        loading,
        error,
    };
}


export default useUser;
