import { Routes, Route } from "react-router-dom";
import SignUp from "../../../user/components/SignUp/SignUp.tsx";
import AddBookAdvertisement from "../../../books/components/AddBookAdvertisement/AddBookAdvertisement.tsx";
import BookBrowser from "../../../books/components/BookBrowser/BookBrowser.tsx";
import LogIn from "../../../user/components/LogIn/LogIn.tsx";
import User from "../../../user/components/User/User.tsx";

function Main() {
    return (
        <div id="main">
            <main>
            <Routes> 
                <Route path="/" element={<BookBrowser mode={"all"} />} />
                <Route path="/pridat-inzerat" element={<AddBookAdvertisement />} />
                <Route path="/prihlasit-se" element={<LogIn />} />
                <Route path="/registrovat-se" element={<SignUp />} />
                <Route path="/moje-inzeraty" element={<BookBrowser mode={"user"} />} />
                <Route path="/uzivatel" element={<User />} />
            </Routes>
            </main>
        </div>
    )
}

export default Main;