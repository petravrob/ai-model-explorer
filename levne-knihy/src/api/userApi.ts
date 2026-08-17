import { User, SignUpData, LoginData } from "../components/user/types";
import { API_URL } from "../config";

/** Načte aktuálně přihlášeného uživatele */
export const getCurrentUser = async (): Promise<User> => {

    const response = await fetch(`${API_URL}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
        },
        body: JSON.stringify({
            token: window.localStorage.getItem("token"),
        }),
    });

    const data = await response.json();

    if (data.status !== "ok") {
        throw new Error(
            "Nepodařilo se načíst aktuálního uživatele."
        );
    }

    return data.data;
};


export const updateUser = async (
    user: User
): Promise<void> => {

    const response = await fetch(`${API_URL}/uzivatel`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
        },
        body: JSON.stringify({
            uname: user.uname,
            fname: user.fname,
            lname: user.lname,
            email: user.email,
            phone: user.phone,
            _id: user._id,
        }),
    });

    const data = await response.json();

    if (data.status !== "ok") {
        throw new Error(
            "Nepodařilo se upravit osobní údaje."
        );
    }
};


export const registerUser = async (
    user: SignUpData
): Promise<void> => {

    const response = await fetch(`${API_URL}/registrovat-se`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
        },
        body: JSON.stringify(user),
    });

    const data = await response.json();

    if (data.status !== "ok") {
        throw new Error(
            "Registrace nebyla úspěšná."
        );
    }
};


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

    const data = await response.json();

    if (data.status !== "ok") {
        throw new Error(
            "Přihlášení nebylo úspěšné."
        );
    }

    return data.data;
};
