import type { ReactNode } from "react";
import { NavLink } from "react-router-dom";

type LinkButtonVariant = "primary" | "outline";

interface LinkButtonProps {
    to?: string;
    href?: string;
    variant?: LinkButtonVariant;
    className?: string;
    children: ReactNode;
}

/** Univerzální odkaz ve stylu tlačítka (interní adresa nebo externí odkaz). */
function LinkButton({ to, href, variant = "primary", className, children }: LinkButtonProps) {
    const classes = `btn${variant === "outline" ? " btn-outline" : ""}${className ? ` ${className}` : ""}`;

    if (href) {
        return (
            <a
                className={classes}
                href={href}
                target="_blank"
                rel="noreferrer"
            >
                {children}
            </a>
        );
    }

    return (
        <NavLink
            to={to ?? "/"}
            className={classes}
        >
            {children}
        </NavLink>
    );
}

export default LinkButton;
