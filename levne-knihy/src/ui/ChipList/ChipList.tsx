import "./ChipList.css";

type ChipListVariant = "primary" | "muted";

interface ChipListProps {
    items: string[];
    // Vysvětlení jednotlivých štítků (zobrazí se po najetí myší)
    itemTitles?: Record<string, string>;
    // Kolik dalších položek se do seznamu nevešlo (vypíše se jako "+3")
    remaining?: number;
    remainingTitle?: string;
    variant?: ChipListVariant;
    className?: string;
}

/** Seznam krátkých štítků (chips) pro snadné prohlédnutí. */
function ChipList({
    items,
    itemTitles,
    remaining = 0,
    remainingTitle,
    variant = "primary",
    className,
}: ChipListProps) {
    const classes = [
        "chip-list",
        variant === "muted" ? "chip-list--muted" : "",
        className ?? "",
    ].filter(Boolean).join(" ");

    return (
        <ul className={classes}>
            {items.map((item) => (
                <li className="chip" key={item} title={itemTitles?.[item]}>
                    {item}
                </li>
            ))}

            {remaining > 0 && (
                <li className="chip" title={remainingTitle}>
                    +{remaining}
                </li>
            )}
        </ul>
    );
}

export default ChipList;
