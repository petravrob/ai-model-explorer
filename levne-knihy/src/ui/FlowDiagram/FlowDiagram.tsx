import "./FlowDiagram.css";

interface FlowDiagramProps {
    // Jednotlivé kroky podle dokumentace modelu (např. vstup, zpracování, výstup)
    steps: string[];
    // Krátké vysvětlení, co schéma znázorňuje, pomáhá i uživateli bez technických znalostí
    description?: string;
    className?: string;
}

/** Zjednodušené schéma průběhu podle dokumentace modelu */
function FlowDiagram({ steps, description, className }: FlowDiagramProps) {
    return (
        <figure
            className={className ? `flow-figure ${className}` : "flow-figure"}
            title={description}
        >
            <ol className="flow">
                {steps.map((step, index) => (
                    <li className="flow__step" key={`${index}-${step}`}>
                        {index > 0 && <span className="flow__arrow" aria-hidden="true" />}

                        <span className="flow__card">
                            <span className="flow__badge" aria-hidden="true">
                                {index + 1}
                            </span>

                            <span className="flow__label">{step}</span>
                        </span>
                    </li>
                ))}
            </ol>
        </figure>
    );
}

export default FlowDiagram;
