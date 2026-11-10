import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import App from "./App";
import "./i18n";
import { translate } from "./i18n/translate";

const rootElement = document.getElementById("root");

if (!rootElement) {
    throw new Error(translate("common:errors.rootElement"));
}

createRoot(rootElement).render(
    <StrictMode>
        <BrowserRouter>
            <App />
        </BrowserRouter>
    </StrictMode>
);

