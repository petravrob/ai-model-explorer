import { Routes, Route } from "react-router-dom";
import { AddBookAdvertisement, BookBrowser } from "@/features/books";
import { LogIn, SignUp, User } from "@/features/user";

function Main() {
    return (
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
    );
}

export default Main;