import "./ScoreBar.css";

interface ScoreBarProps {
    // Podíl 0–100 (používá se jen u výsledků, které se takto vyjadřují)
    percent: number;
    className?: string;
}

/** Vodorovný pruh délkou odpovídající uvedenému výsledku. */
function ScoreBar({ percent, className }: ScoreBarProps) {
    const width = Math.max(0, Math.min(100, percent));

    return (
        <span className={className ? `score-bar ${className}` : "score-bar"} aria-hidden="true">
            <span className="score-bar__fill" style={{ width: `${width}%` }} />
        </span>
    );
}

export default ScoreBar;
