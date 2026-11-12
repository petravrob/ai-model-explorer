import "./styles/global.css";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { DevInfoButton } from "@/features/devInfo";
import { AppLayout } from "@/features/layout";
import { AppRoutes } from "@/routes";

function App() {
  return (
    <>
      <AppLayout>
        <AppRoutes />
      </AppLayout>

      <DevInfoButton />

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
    </>
  );
}

export default App;