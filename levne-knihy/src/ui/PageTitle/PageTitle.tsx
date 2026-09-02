import "./PageTitle.css";

import type { ReactNode } from "react";

interface PageTitleProps {
    children: ReactNode;
    centered?: boolean;
}

/** Nadpis stránky (h2). */
function PageTitle({ children, centered = false }: PageTitleProps) {
    return (
        <h2 className={centered ? "page-title page-title--centered" : "page-title"}>
            {children}
        </h2>
    );
}

export default PageTitle;
