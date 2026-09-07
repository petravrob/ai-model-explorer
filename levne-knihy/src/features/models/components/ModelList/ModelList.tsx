import "./ModelList.css";

import { ModelListProps } from "../../types";

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
                        src={model.image}
                        alt={model.name}
                    />

                    <div>
                        <p className="model-list__name">{model.name}</p>
                        <p className="model-list__author">{model.author}</p>
                        <p className="model-list__price">
                            {model.price} Kč,-
                        </p>
                    </div>
                </li>
            ))}
        </ul>
    );
}

export default ModelList;
