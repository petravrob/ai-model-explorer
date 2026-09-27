import "./styles/global.css";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AppLayout } from "@/features/layout";
import { AuthProvider } from "@/features/user";
import { AppRoutes } from "@/routes";

function App() {
  return (
    <AuthProvider>
      <AppLayout>
        <AppRoutes />
      </AppLayout>

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
    </AuthProvider>
  );
}

export default App;