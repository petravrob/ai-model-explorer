import "./ModelTabs.css";

import { MODEL_TABS_CONFIG, type ModelTabKey } from "../../modelTabsConfig";

interface ModelTabsProps {
    value: ModelTabKey;
    onChange: (value: ModelTabKey) => void;
}

/** Štítky nad prohlížečem modelů, které rychle vyfiltrují podle podmínky, jaké modely se zobrazí. */
function ModelTabs({ value, onChange }: ModelTabsProps) {
    return (
        <div className="model-tabs" role="group" aria-label="Štítky výpisu modelů">
            {MODEL_TABS_CONFIG.map((tabOption) => (
                <button
                    key={tabOption.value}
                    type="button"
                    className={`model-tabs__tab${
                        tabOption.value === value ? " model-tabs__tab--active" : ""
                    }`}
                    title={tabOption.description}
                    aria-pressed={tabOption.value === value}
                    onClick={() => onChange(tabOption.value)}
                >
                    {tabOption.label}
                </button>
            ))}
        </div>
    );
}

export default ModelTabs;

