import "./PageTitle.css";

import type { ReactNode } from "react";

interface PageTitleProps {
    children: ReactNode;
    centered?: boolean;
    compact?: boolean;
}

/** Nadpis stránky (h2). */
function PageTitle({ children, centered = false, compact = false }: PageTitleProps) {
    const classNames = [
        "page-title",
        centered && "page-title--centered",
        compact && "page-title--compact",
    ]
        .filter(Boolean)
        .join(" ");

    return (
        <h2 className={classNames}>
            {children}
        </h2>
    );
}

export default PageTitle;
