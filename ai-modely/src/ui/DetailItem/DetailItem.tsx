import "./DetailItem.css";

import type { ReactNode } from "react";

interface DetailItemProps {
    label: string;
    value: ReactNode;
    /** Hodnota, která se zobrazí místo chybějícího údaje. */
    missing?: boolean;
}

/** Řádek detailu – popisek a hodnota. */
function DetailItem({ label, value, missing = false }: DetailItemProps) {
    return (
        <div className="detail-item">
            <span className="detail-item__label">{label}</span>
            <strong className={`detail-item__value${missing ? " detail-item__value--missing" : ""}`}>
                {value}
            </strong>
        </div>
    );
}

export default DetailItem;