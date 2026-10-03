import { AIModel } from "../types";
import { MODEL_TABS_CONFIG, type ModelTabKey, type ModelTabOption } from "../modelTabsConfig";

/** Zúží výpis modelů na ty, které odpovídají zvolenému štítku. */
export const applyTab = (
    models: AIModel[],
    tab: ModelTabKey
): AIModel[] => {

    const tabConfig: ModelTabOption =
        MODEL_TABS_CONFIG.find((tabOption) => tabOption.value === tab) ??
        MODEL_TABS_CONFIG[0];

    return tabConfig.filter(models);
};

