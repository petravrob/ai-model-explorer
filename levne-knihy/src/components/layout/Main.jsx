import "../../App.css";
import { Routes, Route } from "react-router-dom";
import Books from "../books/Books.jsx";
import AddItem from "../books/AddItem.jsx";
import LogIn from "../auth/LogIn.jsx";
import SignUp from "../auth/SignUp.jsx";
import MyItems from "../books/MyItems.jsx";
import User from "../user/User.jsx";

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