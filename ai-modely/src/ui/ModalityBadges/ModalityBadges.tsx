import "./ModalityBadges.css";

import Icon from "../Icon/Icon";
import { AUDIO_ICON, IMAGE_ICON, TEXT_ICON, VIDEO_ICON } from "../Icon/icons";

// Ikony pro druhy vstupů a výstupů, které dokumentace modelů uvádí česky
const MODALITY_ICONS = [
    { pattern: /^text/i, icon: TEXT_ICON },
    { pattern: /(obráz|obraz|image|vision|foto)/i, icon: IMAGE_ICON },
    { pattern: /(zvuk|audio|řeč|rec|hlas)/i, icon: AUDIO_ICON },
    { pattern: /(video|film)/i, icon: VIDEO_ICON },
];

interface ModalityBadgesProps {
    items: string[];
    className?: string;
}

/** Druhy vstupů a výstupů modelu jako odznaky s ikonou. */
function ModalityBadges({ items, className }: ModalityBadgesProps) {
    return (
        <ul className={className ? `modality-badges ${className}` : "modality-badges"}>
            {items.map((item) => {
                const icon = MODALITY_ICONS.find((modality) => modality.pattern.test(item))?.icon;

                return (
                    <li className="modality-badges__item" key={item}>
                        {icon && <Icon path={icon} className="modality-badges__icon" />}

                        {item}
                    </li>
                );
            })}
        </ul>
    );
}

export default ModalityBadges;
