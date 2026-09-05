import "./styles/global.css";
import "./App.css";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AuthProvider } from "@/features/user";
import { Footer, Header } from "@/features/layout";
import { AppRoutes } from "@/routes";

function App() {
  return (
    <AuthProvider>
    <div className="app">
      <Header/>
      <main>
        <AppRoutes />
      </main>
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
    </AuthProvider>
  );
}

export default App;