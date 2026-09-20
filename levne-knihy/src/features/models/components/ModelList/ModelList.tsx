import "./ModelList.css";

import { ModelListProps } from "../../types";
import { formatCount } from "../../utils/formatters";
import ModelImage from "./ModelImage";

/** Zobrazuje seznam modelů */
function ModelList({ models, onModelClick }: ModelListProps) {
    return (
        <ul className="model-list">
            {models.map((model) => (
                <li
                    className="model-list__item"
                    key={model._id ?? model.modelId}
                    onClick={() => onModelClick(model)}
                >
                    <ModelImage
                        name={model.name}
                        task={model.task}
                        author={model.author}
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
