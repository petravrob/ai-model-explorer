import "./LogoLoader.css";

import Icon from "../Icon/Icon";
import { ROBOT_ICON } from "../Icon/icons";

interface LogoLoaderProps {
    // Text, který se ohlásí čtečkám obrazovky (na stránce se nezobrazuje)
    label?: string;
}

/**
 * Animace při načítaní s logem aplikace
 */
function LogoLoader({ label = "Aktualizace modelů" }: LogoLoaderProps) {
    return (
        <div className="logo-loader" role="status">
            <span className="logo-loader__badge" aria-hidden="true">
                <span className="logo-loader__spark" />
                <span className="logo-loader__spark logo-loader__spark--slow" />

                <Icon path={ROBOT_ICON} className="logo-loader__icon" />
            </span>

            <span className="logo-loader__label">{label}</span>
        </div>
    );
}

export default LogoLoader;
