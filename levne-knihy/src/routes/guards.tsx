import { Navigate, Outlet, useLocation } from "react-router-dom";

import { useAuthContext } from "@/features/user/context/AuthContext";
import { PageMessage } from "@/ui";
import { ROUTE_PATHS } from "./paths";

/** Načítací zpráva zobrazovaná při ověřování přihlášení. */
function AuthLoading() {
    return (
        <PageMessage>
            Ověřování přihlášení...
        </PageMessage>
    );
}

/**
 * Strážce stránek přístupných pouze přihlášenému uživateli.
 * Nepřihlášeného uživatele přesměruje na přihlášení
 * a zapamatuje si stránku, na kterou chtěl jít.
 */
export function RequireAuth() {
    const { user, loading } = useAuthContext();

    const location = useLocation();

    if (loading) {
        return <AuthLoading />;
    }

    if (!user) {
        return (
            <Navigate
                to={ROUTE_PATHS.login}
                state={{ from: location }}
                replace
            />
        );
    }

    return <Outlet />;
}

/**
 * Strážce stránek pro nepřihlášené uživatele (přihlášení, registrace).
 * Přihlášeného uživatele přesměruje na hlavní stránku.
 */
export function RequireGuest() {
    const { user, loading } = useAuthContext();

    if (loading) {
        return <AuthLoading />;
    }

    if (user) {
        return (
            <Navigate
                to={ROUTE_PATHS.home}
                replace
            />
        );
    }

    return <Outlet />;
}
