import "./DetailItem.css";

import type { ReactNode } from "react";

/** Hodnota, která se zobrazí místo chybějícího údaje. */
export const MISSING_VALUE = "——";

interface DetailItemProps {
    label: string;
    value: ReactNode;
}

/** Řádek detailu – popisek a hodnota. */
function DetailItem({ label, value }: DetailItemProps) {
    return (
        <div className="detail-item">
            <span className="detail-item__label">{label}</span>
            <strong className={`detail-item__value${value === MISSING_VALUE ? " detail-item__value--missing" : ""}`}>
                {value}
            </strong>
        </div>
    );
}

export default DetailItem;