import { Route, Routes } from "react-router-dom";

import { ModelBrowser, ModelDetailPage } from "@/features/models";
import { LogIn, SignUp, User } from "@/features/user";
import NotFound from "@/features/layout/components/NotFound/NotFound";
import { RequireAuth, RequireGuest } from "./guards";
import { ROUTE_PATHS } from "./paths";

/** Centralizovaná routovací tabulka celé aplikace. */
function AppRoutes() {
    return (
        <Routes>
            {/* Veřejné stránky */}
            <Route
                path={ROUTE_PATHS.home}
                element={<ModelBrowser />}
            />

            <Route
                path={ROUTE_PATHS.modelDetail}
                element={<ModelDetailPage />}
            />

            {/* Stránky pouze pro nepřihlášené uživatele */}
            <Route element={<RequireGuest />}>
                <Route
                    path={ROUTE_PATHS.login}
                    element={<LogIn />}
                />

                <Route
                    path={ROUTE_PATHS.signUp}
                    element={<SignUp />}
                />
            </Route>

            {/* Stránky pouze pro přihlášené uživatele */}
            <Route element={<RequireAuth />}>
                <Route
                    path={ROUTE_PATHS.user}
                    element={<User />}
                />
            </Route>

            {/* Neznámá adresa */}
            <Route
                path={ROUTE_PATHS.notFound}
                element={<NotFound />}
            />
        </Routes>
    );
}

export default AppRoutes;
