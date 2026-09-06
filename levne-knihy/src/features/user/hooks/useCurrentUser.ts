import { useAuthContext } from "../context/AuthContext";


/** Načte aktuálně přihlášeného uživatele (sdílený autentizační kontext). */
function useCurrentUser() {

    const {
        user,
        loading,
        error,
    } = useAuthContext();


    return {
        user,
        loading,
        error,
    };
}


export default useCurrentUser;

