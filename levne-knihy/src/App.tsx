import "./styles/global.css";
import "./App.css";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Footer, Header, Main } from "@/features/layout";

function App() {
  return (
    <div className="app">
      <Header/>
      <Main/>
      <Footer/>
      <ToastContainer
                position="bottom-left"
                autoClose={4000}
                hideProgressBar={true}
                newestOnTop
                closeOnClick
                pauseOnHover
                draggable
                theme="light"
            />
    </div>
  );
}

export default App;