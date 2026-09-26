import "./DetailGrid.css";

import DetailItem from "../DetailItem/DetailItem";

export interface DetailGridItem {
    label: string;
    value: string;
}

interface DetailGridProps {
    items: DetailGridItem[];
    className?: string;
}

/** Mřížka údajů (popisek a hodnota) na tolika sloupcích, kolik se jich vejde. */
function DetailGrid({ items, className }: DetailGridProps) {
    return (
        <div className={className ? `detail-grid ${className}` : "detail-grid"}>
            {items.map((item) => (
                <DetailItem label={item.label} value={item.value} key={item.label} />
            ))}
        </div>
    );
}

export default DetailGrid;
