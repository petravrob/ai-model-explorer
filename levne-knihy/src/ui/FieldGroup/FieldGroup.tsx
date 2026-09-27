import "./FieldGroup.css";

import type { ReactNode } from "react";

import SectionTitle from "../SectionTitle/SectionTitle";

interface FieldGroupProps {
    label: string;
    className?: string;
    children: ReactNode;
}

/** Skupina údajů s vlastním nadpisem uvnitř sekce (např. doporučené nastavení). */
function FieldGroup({ label, className, children }: FieldGroupProps) {
    return (
        <div className={className ? `field-group ${className}` : "field-group"}>
            <SectionTitle>{label}</SectionTitle>

            {children}
        </div>
    );
}

export default FieldGroup;
