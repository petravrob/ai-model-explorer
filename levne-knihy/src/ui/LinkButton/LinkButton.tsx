import type { ReactNode } from "react";
import { NavLink } from "react-router-dom";

type LinkButtonVariant = "primary" | "outline";

interface LinkButtonProps {
    to: string;
    variant?: LinkButtonVariant;
    children: ReactNode;
}

/** Univerzální odkaz ve stylu tlačítka. */
function LinkButton({ to, variant = "primary", children }: LinkButtonProps) {
    const variantClass = variant === "outline" ? " btn-outline" : "";

    return (
        <NavLink
            to={to}
            className={`btn${variantClass}`}
        >
            {children}
        </NavLink>
    );
}

export default LinkButton;