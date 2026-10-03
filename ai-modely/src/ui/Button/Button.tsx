import "./Button.css";

import type { ButtonHTMLAttributes } from "react";

type ButtonVariant = "primary" | "outline" | "icon";

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
    primary: "",
    outline: " btn-outline",
    icon: " btn-icon",
};

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
    const variantClass = VARIANT_CLASSES[variant];

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
