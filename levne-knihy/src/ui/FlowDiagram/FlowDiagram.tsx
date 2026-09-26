import "./FlowDiagram.css";

interface FlowDiagramProps {
    // Jednotlivé kroky přesně podle dokumentace modelu (např. vstup, architektura, výstup)
    steps: string[];
    className?: string;
}

/** Zjednodušené schéma toku podle dokumentace modelu (na úzké obrazovce pod sebou). */
function FlowDiagram({ steps, className }: FlowDiagramProps) {
    return (
        <ol className={className ? `flow ${className}` : "flow"}>
            {steps.map((step, index) => (
                <li className="flow__step" key={step}>
                    {index > 0 && <span className="flow__arrow" aria-hidden="true" />}

                    <span className="flow__label">{step}</span>
                </li>
            ))}
        </ol>
    );
}

export default FlowDiagram;
