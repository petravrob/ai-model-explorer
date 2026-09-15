import { handleApiResponse } from "@/api/apiUtils";
import { API_URL } from "@/config";
import { AIModel, ModelFilters } from "@/features/models";
import type { ModelSortKey } from "../modelSortsConfig";

/** Sestaví dotazovací řetězec ze zvolených filtrů (žádný filtr = bez parametrů). */
const buildFiltersQuery = (filters: ModelFilters): string => {

    const params = new URLSearchParams();

    // Klíče kategorií filtrů se stanou názvy opakovatelných parametrů (např. „tasks=text-generation“)
    Object.entries(filters).forEach(([key, values]) =>
        values.forEach((value) => params.append(key, value))
    );

    const query = params.toString();

    return query ? `?${query}` : "";
};

/** Načte modely se zvolenými filtry a řazením ze serveru. */
export const getModels = async (
    filters?: ModelFilters,
    sort?: ModelSortKey
): Promise<AIModel[]> => {

    const params = filters ? new URLSearchParams(buildFiltersQuery(filters).slice(1)) : new URLSearchParams();

    if (sort) {
        params.set("sort", sort);
    }

    const response = await fetch(
        `${API_URL}/api/models${params.toString() ? `?${params.toString()}` : ""}`,
        {
            method: "GET",
        }
    );

    const data = await handleApiResponse<AIModel[]>(
        response,
        "Nepodařilo se načíst modely."
    );

    return data.data as AIModel[];
};


/** Načte jeden model podle jeho identifikátoru. */
export const getModel = async (
    modelId: string
): Promise<AIModel> => {

    const response = await fetch(
        `${API_URL}/api/models/${encodeURIComponent(modelId)}`,
        {
            method: "GET",
        }
    );

    const data = await handleApiResponse<AIModel>(
        response,
        "Nepodařilo se načíst model."
    );

    return data.data as AIModel;
};
