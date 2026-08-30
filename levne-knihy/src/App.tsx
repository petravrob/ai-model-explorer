import "./styles/global.css";
import "./styles/buttons.css";
import "./App.css";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Footer from './features/layout/components/Footer/Footer.tsx';
import Header from "./features/layout/components/Header/Header.tsx"
import Main from "./features/layout/components/Main/Main.tsx"

function App() {
  return (
    <div className="App">
      <div className='container'>
      <Header/>
      <Main/>
      </div>
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