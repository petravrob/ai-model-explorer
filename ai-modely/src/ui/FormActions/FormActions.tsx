import "./FormActions.css";

import type { ReactNode } from "react";

/** Akční řádek formuláře – umístí tlačítka doprava. */
function FormActions({ children }: { children: ReactNode }) {
    return (
        <div className="form-actions">
            {children}
        </div>
    );
}

export default FormActions;
