import "./AppLayout.css";

import type { ReactNode } from "react";

import Header from "../Header/Header";

/** Rozvržení aplikace: horní lišta s logem a obsah stránky. */
function AppLayout({ children }: { children: ReactNode }) {
    return (
        <div className="app-layout">
            <Header />

            <main className="app-layout__main">
                {children}
            </main>
        </div>
    );
}

export default AppLayout;
