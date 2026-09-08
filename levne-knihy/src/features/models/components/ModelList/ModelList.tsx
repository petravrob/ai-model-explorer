import "./ModelList.css";

import { ModelListProps } from "../../types";
import { formatCount } from "../../utils/formatters";

/** Vytvoří jednoduchý placeholder obrázek modelu – barevný blok s počátečním písmenem. */
function createModelImage(name: string, task: string): string {

    // Odstín se odvodí z názvu a úlohy, aby měl každý model svou stabilní barvu
    const hash = [...(name + task)].reduce(
        (sum, character) => sum + character.charCodeAt(0),
        0
    );

    const hue = hash % 360;
    const letter = (name[0] ?? "?").toUpperCase();

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300">
        <rect width="400" height="300" fill="hsl(${hue}, 32%, 40%)"/>
        <text x="200" y="200" text-anchor="middle" font-family="Arial, sans-serif" font-size="150" font-weight="700" fill="rgba(255, 255, 255, 0.85)">${letter}</text>
    </svg>`;

    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

/** Zobrazuje seznam modelů */
function ModelList({ models, onModelClick }: ModelListProps) {
    return (
        <ul className="model-list">
            {models.map((model) => (
                <li
                    className="model-list__item"
                    key={model._id}
                    onClick={() => onModelClick(model)}
                >
                    <img
                        className="model-list__image"
                        src={model.avatarUrl ?? createModelImage(model.name, model.task)}
                        alt={model.name}
                    />

                    <div>
                        <p className="model-list__name">{model.name}</p>
                        <p className="model-list__author">{model.author}</p>
                        <p className="model-list__task">{model.task}</p>
                        <p className="model-list__stats">
                            {`${formatCount(model.downloads)} stažení · ${formatCount(model.likes)} ♥`}
                        </p>
                    </div>
                </li>
            ))}
        </ul>
    );
}

export default ModelList;
