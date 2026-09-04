import { useEffect, useState } from "react";

import { User } from "../types";
import { getCurrentUser } from "../api/userApi";


/** Načte aktuálně přihlášeného uživatele */
function useCurrentUser(loginNotRequired: boolean = true) {

    const [user, setUser] =
        useState<User | null>(null);

    const [loading, setLoading] =
        useState<boolean>(loginNotRequired);

    const [error, setError] =
        useState<string | null>(null);


    useEffect(() => {

        if (!loginNotRequired) {
            return;
        }

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

                const errorMessage =
                    error instanceof Error
                        ? error.message
                        : "Nepodařilo se načíst uživatele.";

                setError(errorMessage);

            } finally {

                setLoading(false);

            }

        };

        loadUser();

    }, [loginNotRequired]);


    return {
        user,
        loading,
        error,
    };
}


export default useCurrentUser;