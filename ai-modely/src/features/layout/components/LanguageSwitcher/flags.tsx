import { useId } from "react";

interface FlagProps {
    className?: string;
}

/** Česká vlajka jako inline SVG. */
export function CzechFlag({ className }: FlagProps) {
    return (
        <svg className={className} viewBox="0 0 60 40" aria-hidden="true" focusable="false">
            <rect width="60" height="40" fill="#ffffff" />
            <rect y="20" width="60" height="20" fill="#d7141a" />
            <polygon points="0,0 30,20 0,40" fill="#11457e" />
        </svg>
    );
}

/** Vlajka Velké Británie (zjednodušená) jako inline SVG pro angličtinu. */
export function EnglishFlag({ className }: FlagProps) {
    // Každá instance potřebuje vlastní id, jinak by se všechny vlajky odkazovaly na první
    const clipId = useId();

    return (
        <svg className={className} viewBox="0 0 60 40" aria-hidden="true" focusable="false">
            <clipPath id={clipId}>
                <rect width="60" height="40" />
            </clipPath>
            <g clipPath={`url(#${clipId})`}>
                <rect width="60" height="40" fill="#012169" />
                <path d="M0 0 L60 40 M60 0 L0 40" stroke="#ffffff" strokeWidth="8" />
                <path d="M0 0 L60 40 M60 0 L0 40" stroke="#c8102e" strokeWidth="2.5" />
                <path d="M30 0 V40 M0 20 H60" stroke="#ffffff" strokeWidth="13" />
                <path d="M30 0 V40 M0 20 H60" stroke="#c8102e" strokeWidth="7.5" />
            </g>
        </svg>
    );
}
