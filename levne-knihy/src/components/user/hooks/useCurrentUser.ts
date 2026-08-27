import { useEffect, useState } from "react";

import { getCurrentUser } from "../../../api/userApi";
import { User } from "../types";


/** Načte aktuálně přihlášeného uživatele */
function useCurrentUser() {

    const [user, setUser] =
        useState<User | null>(null);

    const [loading, setLoading] =
        useState<boolean>(true);

    const [error, setError] =
        useState<string | null>(null);


    useEffect(() => {

        // Načtení aktuálně přihlášeného uživatele
        const loadUser = async (): Promise<void> => {

            try {

                setLoading(true);
                setError(null);

                const userData = await getCurrentUser();

                setUser(userData);

            } catch (error) {

                console.error(
                    "Nepodařilo se načíst uživatele:",
                    error
                );

                setError(
                    "Nepodařilo se načíst uživatele."
                );

            } finally {

                setLoading(false);

            }

        };

        loadUser();

    }, []);


    return {
        user,
        loading,
        error,
    };
}


export default useCurrentUser;
