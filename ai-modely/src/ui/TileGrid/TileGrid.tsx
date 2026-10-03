import "./TileGrid.css";

interface TileGridProps {
    items: string[];
    className?: string;
}

/** Mřížka krátkých dlaždic (např. scénáře použití modelu). */
function TileGrid({ items, className }: TileGridProps) {
    return (
        <ul className={className ? `tile-grid ${className}` : "tile-grid"}>
            {items.map((item) => (
                <li className="tile-grid__item" key={item}>
                    {item}
                </li>
            ))}
        </ul>
    );
}

export default TileGrid;
