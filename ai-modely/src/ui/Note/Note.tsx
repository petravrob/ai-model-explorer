import "./Note.css";

import type { ReactNode } from "react";

/** Drobná poznámka pod obsahem (odkud údaje pocházejí apod.). */
function Note({ children }: { children: ReactNode }) {
    return <p className="note">{children}</p>;
}

export default Note;
