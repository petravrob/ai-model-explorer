import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import { useAuthContext } from "../context/AuthContext";
import { ROUTE_PATHS } from "@/routes/paths";


/** Odhlásí uživatele a přesměruje ho na hlavní stránku. */
function useLogout() {

    const navigate = useNavigate();

    const { logout } = useAuthContext();

    // Odhlášení uživatele
    const logoutHandler = (): void => {

        logout();

        toast.success("Byli jste odhlášeni.");

        navigate(ROUTE_PATHS.home);

    };


    return {
        logout: logoutHandler,
    };
}


export default useLogout;
