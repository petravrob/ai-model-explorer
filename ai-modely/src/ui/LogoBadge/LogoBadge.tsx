import "./LogoBadge.css";

import Icon from "../Icon/Icon";
import { ROBOT_ICON } from "../Icon/icons";

interface LogoBadgeProps {
    // Třída pro konkrétní použití (nastavuje velikost a spouští animaci)
    className?: string;
    // Text pro čtečky obrazovky
    label?: string;
    playing?: boolean;
}

/**
 * Logo aplikace s animací
 */
function LogoBadge({ className, label, playing = false }: LogoBadgeProps) {
    const classes = ["logo-badge", playing ? "logo-badge--playing" : "", className ?? ""].filter(Boolean);

    return (
        <span className={classes.join(" ")} role={label ? "status" : undefined}>
            <span className="logo-badge__mark" aria-hidden="true">
                <span className="logo-badge__spark" />
                <span className="logo-badge__spark logo-badge__spark--slow" />

                <Icon path={ROBOT_ICON} className="logo-badge__icon" />
            </span>

            {label && <span className="logo-badge__label">{label}</span>}
        </span>
    );
}

export default LogoBadge;
