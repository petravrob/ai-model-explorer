import "./PageMessage.css";

import type { ReactNode } from "react";

/** Centrální zpráva stránky – načítání, chyba nebo prázdný stav. */
function PageMessage({ children }: { children: ReactNode }) {
    return (
        <p className="page-message">
            {children}
        </p>
    );
}

export default PageMessage;
