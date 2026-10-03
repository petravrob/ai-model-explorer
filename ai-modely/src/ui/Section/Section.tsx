import "./Section.css";

import type { ReactNode } from "react";

import SectionTitle from "../SectionTitle/SectionTitle";

interface SectionProps {
    title: string;
    className?: string;
    children: ReactNode;
}

/** Sekce stránky – nadpis a obsah pod ním. */
function Section({ title, className, children }: SectionProps) {
    return (
        <section className={className ? `section ${className}` : "section"}>
            <SectionTitle>{title}</SectionTitle>

            {children}
        </section>
    );
}

export default Section;
