import "./Icon.css";

interface IconProps {
    // SVG cesta pro viewBox 24×24
    path: string;
    className?: string;
}

/** Ikona ze SVG cesty, barvu dědí z okolního textu. */
function Icon({ path, className }: IconProps) {
    return (
        <svg
            className={className ? `icon ${className}` : "icon"}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            <path d={path} />
        </svg>
    );
}

export default Icon;
