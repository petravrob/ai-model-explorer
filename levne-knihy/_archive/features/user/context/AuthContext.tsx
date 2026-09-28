import type { ReactNode } from "react";
import { createContext, useContext, useEffect, useState } from "react";

import { User } from "../types";
import { getCurrentUser } from "../api/userApi";

/** Hodnota poskytovaná autentizačním kontextem. */
interface AuthContextValue {
    user: User | null;
    loading: boolean;
    error: string | null;

    /** Přihlásí uživatele – uloží token a načte jeho údaje. */
    login: (token: string) => void;

    /** Odhlásí uživatele – zahodí token i jeho údaje. */
    logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

/** Poskytuje aktuálně přihlášeného uživatele celé aplikaci. */
export function AuthProvider({ children }: { children: ReactNode }) {

    const [token, setToken] =
        useState<string | null>(window.localStorage.getItem("token"));

    const [user, setUser] =
        useState<User | null>(null);

    const [loading, setLoading] =
        useState<boolean>(Boolean(token));

    const [error, setError] =
        useState<string | null>(null);

    // Načtení uživatele po změně tokenu
    useEffect(() => {

        if (!token) {
            setUser(null);
            setLoading(false);
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

                setUser(null);

            } finally {

                setLoading(false);

            }

        };

        loadUser();

    }, [token]);

    // Přihlášení – uložení tokenu spustí načtení uživatele.
    const login = (newToken: string): void => {

        window.localStorage.setItem("token", newToken);

        setToken(newToken);

        setLoading(true);

    };

    // Odhlášení – zahození tokenu i údajů uživatele
    const logout = (): void => {

        window.localStorage.clear();

        setToken(null);
        setUser(null);
        setError(null);

    };

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                error,
                login,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

/** Zpřístupňuje aktuálně přihlášeného uživatele. */
export function useAuthContext(): AuthContextValue {

    const context = useContext(AuthContext);

    if (!context) {
        throw new Error(
            "Nepodařilo se načíst informace o uživateli. (useAuthContext musí být použit uvnitř AuthProvideru.)"
        );
    }

    return context;
}
