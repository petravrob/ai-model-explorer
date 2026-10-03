import "./Form.css";

import type { FormHTMLAttributes, ReactNode } from "react";

interface FormProps extends FormHTMLAttributes<HTMLFormElement> {
    children: ReactNode;
}

/** Základní formulář – společné rozvržení a styly vstupních prvků. */
function Form({ children, className, ...rest }: FormProps) {
    return (
        <form
            className={className ? `form ${className}` : "form"}
            {...rest}
        >
            {children}
        </form>
    );
}

export default Form;
