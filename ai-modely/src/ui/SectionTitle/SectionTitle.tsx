import "./SectionTitle.css";

import type { ReactNode } from "react";

interface SectionTitleProps {
    children: ReactNode;
}

/** Nadpis sekce (h3). */
function SectionTitle({ children }: SectionTitleProps) {
    return (
        <h3 className="section-title">
            {children}
        </h3>
    );
}

export default SectionTitle;