import "./BulletList.css";

type BulletListVariant = "bullet" | "check";

interface BulletListProps {
    items: string[];
    // "check" se hodí pro výčet předností modelu
    variant?: BulletListVariant;
    className?: string;
}

/** Odrážkový seznam krátkých textů. */
function BulletList({ items, variant = "bullet", className }: BulletListProps) {
    const classes = [
        "bullet-list",
        variant === "check" ? "bullet-list--check" : "",
        className ?? "",
    ].filter(Boolean).join(" ");

    return (
        <ul className={classes}>
            {items.map((item) => (
                <li key={item}>{item}</li>
            ))}
        </ul>
    );
}

export default BulletList;
