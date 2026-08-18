import "./App.css";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Footer from './components/layout/Footer.tsx';
import Header from "./components/layout/Header.tsx"
import Main from "./components/layout/Main.tsx"

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