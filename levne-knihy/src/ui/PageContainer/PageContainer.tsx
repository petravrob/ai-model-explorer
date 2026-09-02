import "./PageContainer.css";

import type { ReactNode } from "react";

/** Obal stránky – zajistí maximální šířku, vycentrování a vnitřní odsazení. */
function PageContainer({ children }: { children: ReactNode }) {
    return (
        <div className="page-container">
            {children}
        </div>
    );
}

export default PageContainer;
