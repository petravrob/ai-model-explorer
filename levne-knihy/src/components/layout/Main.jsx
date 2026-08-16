import "../../App.css";
import { Routes, Route } from "react-router-dom";
import AddItem from "../books/components/AddItem.js";
import LogIn from "../auth/LogIn.jsx";
import SignUp from "../auth/SignUp.jsx";
import BookBrowser from "../books/components/BookBrowser.tsx";
import User from "../user/User.jsx";
import BookDetail from "../books/components/BookDetail.tsx";

function Main() {
    return (
        <div id="main">
            <main>
            <Routes> 
                <Route path="/" element={<BookBrowser mode={"all"} />} />
                <Route path="/pridat-inzerat" element={<AddItem />} />
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