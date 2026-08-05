import "../App.css";
import { Routes, Route } from "react-router-dom";
import Books from "./Books";
import AddItem from "./AddItem";
import LogIn from "./LogIn";
import SignUp from "./SignUp";
import MyItems from "./MyItems";
import User from "./User";
import BookDetail from "./BookDetail";

function Main() {
    return (
        <div id="main">
            <main>
            <Routes> 
                <Route path="/" element={<Books />} />
                <Route path="/pridat-inzerat" element={<AddItem />} />
                <Route path="/prihlasit-se" element={<LogIn />} />
                <Route path="/registrovat-se" element={<SignUp />} />
                <Route path="/moje-inzeraty" element={<MyItems />} />
                <Route path="/uzivatel" element={<User />} />
            </Routes>
            </main>
        </div>
    )
}

export default Main;