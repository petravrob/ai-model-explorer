import { User, LoginData, UserFormData } from "../features/user/types";
import { API_URL } from "../config";
import { getAuthHeaders } from "./authApi";
import { handleApiResponse } from "./apiUtils";
import { toast } from "react-toastify";

/** Načte aktuálně přihlášeného uživatele. */
export const getCurrentUser = async (): Promise<User> => {

    const response = await fetch(`${API_URL}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            ...getAuthHeaders(),
        },
    });

    const data = await handleApiResponse<User>(
        response,
        "Nepodařilo se načíst aktuálního uživatele."
    );

    return data.data as User;
};

/** Aktualizuje údaje uživatele. */
export const updateUser = async (
    user: User
): Promise<void> => {

    const response = await fetch(`${API_URL}/uzivatel`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            ...getAuthHeaders(),
        },
        body: JSON.stringify({
            fname: user.fname,
            lname: user.lname,
            email: user.email,
            phone: user.phone,
        }),
    });

    await handleApiResponse(
        response,
        "Nepodařilo se upravit osobní údaje."
    );
};

/** Zaregistruje uživatele. */
export const registerUser = async (
    user: UserFormData
): Promise<void> => {

    const response = await fetch(`${API_URL}/registrovat-se`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
        },
        body: JSON.stringify(user),
    });

    await handleApiResponse(
        response,
        "Registrace nebyla úspěšná."
    );
};

/** Přihlásí uživatele. */
export const loginUser = async (
    loginData: LoginData
): Promise<string> => {

    const response = await fetch(`${API_URL}/prihlasit-se`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
        },
        body: JSON.stringify(loginData),
    });

    const data = await handleApiResponse<{
        token: string;
    }>(
        response,
        "Přihlášení nebylo úspěšné."
    );

    return data.token;
};

/** Odhlásí uživatele. */
function useLogout() {

    const logout = (): void => {

        window.localStorage.clear();

        window.location.href = "./";

        toast.success("Byli jste odhlášeni.");

    };

    return {
        logout,
    };
}

export default useLogout; 
