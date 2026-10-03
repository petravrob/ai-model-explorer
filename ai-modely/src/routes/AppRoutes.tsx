import { Route, Routes } from "react-router-dom";

import { ModelBrowser, ModelDetailPage } from "@/features/models";
import NotFound from "@/features/layout/components/NotFound/NotFound";
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

            {/* Neznámá adresa */}
            <Route
                path={ROUTE_PATHS.notFound}
                element={<NotFound />}
            />
        </Routes>
    );
}

export default AppRoutes;
