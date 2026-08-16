import { API_URL } from "../config.js";
import ApiResponse from "../components/types.ts"


export interface User {
    uname: string;
    fname: string;
    lname: string;
    phone: string;
}

/** Načtení přihlášeného uživatele */
export const getCurrentUser = async (): Promise<User> => {

    const response = await fetch(`${API_URL}/`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
        },
        body: JSON.stringify({
            token: window.localStorage.getItem("token"),
        }),
    });

    if (!response.ok) {
        throw new Error(
            "Nepodařilo se načíst údaje uživatele."
        );
    }

    const data: ApiResponse<User> = await response.json();

    return data.data;
};
