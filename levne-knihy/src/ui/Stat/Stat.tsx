import "./Stat.css";

import Icon from "../Icon/Icon";

type StatSize = "md" | "sm";

interface StatProps {
    // SVG cesta ikony (viewBox 24×24)
    icon: string;
    // Zvýrazněná hodnota (už naformátovaná)
    value: string;
    label: string;
    size?: StatSize;
    className?: string;
}

/** Údaj s ikonou (např. počet stažení nebo oblíbení). */
function Stat({ icon, value, label, size = "md", className }: StatProps) {
    const classes = [
        "stat",
        size === "sm" ? "stat--sm" : "",
        className ?? "",
    ].filter(Boolean).join(" ");

    return (
        <span className={classes}>
            <Icon path={icon} className="stat__icon" />
            <strong>{value}</strong> {label}
        </span>
    );
}

export default Stat;
