import "../App.css";
import { Routes, Route } from "react-router-dom";
import Books from "./Books.jsx";
import AddItem from "./AddItem.jsx";
import LogIn from "./LogIn.jsx";
import SignUp from "./SignUp.jsx";
import MyItems from "./MyItems.jsx";
import User from "./User.jsx";
import BookDetail from "./BookDetail.jsx";

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