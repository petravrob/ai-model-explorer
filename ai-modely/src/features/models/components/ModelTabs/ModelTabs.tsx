import "./ModelTabs.css";

import { useTranslation } from "react-i18next";

import { translate } from "@/i18n/translate";

import { MODEL_TABS_CONFIG, type ModelTabKey } from "../../modelTabsConfig";

interface ModelTabsProps {
    value: ModelTabKey;
    onChange: (value: ModelTabKey) => void;
}

/** Štítky nad prohlížečem modelů, které rychle vyfiltrují podle podmínky, jaké modely se zobrazí. */
function ModelTabs({ value, onChange }: ModelTabsProps) {
    const { t } = useTranslation("models");

    return (
        <div className="model-tabs" role="group" aria-label={t("tabs.ariaLabel")}>
            {MODEL_TABS_CONFIG.map((tabOption) => (
                <button
                    key={tabOption.value}
                    type="button"
                    className={`model-tabs__tab${
                        tabOption.value === value ? " model-tabs__tab--active" : ""
                    }`}
                    title={translate(`models:tabs.${tabOption.value}.description`)}
                    aria-pressed={tabOption.value === value}
                    onClick={() => onChange(tabOption.value)}
                >
                    {translate(`models:tabs.${tabOption.value}.label`)}
                </button>
            ))}
        </div>
    );
}

export default ModelTabs;

