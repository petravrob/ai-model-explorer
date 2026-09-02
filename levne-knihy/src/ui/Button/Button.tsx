import "./Button.css";

import type { ButtonHTMLAttributes } from "react";

type ButtonVariant = "primary" | "outline";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant;
}

/** Univerzální tlačítko aplikace. */
function Button({
    variant = "primary",
    type = "button",
    className,
    children,
    ...rest
}: ButtonProps) {
    const variantClass = variant === "outline" ? " btn-outline" : "";

    return (
        <button
            type={type}
            className={`btn${variantClass}${className ? ` ${className}` : ""}`}
            {...rest}
        >
            {children}
        </button>
    );
}

export default Button;
