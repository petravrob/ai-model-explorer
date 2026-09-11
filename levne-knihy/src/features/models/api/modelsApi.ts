import { handleApiResponse } from "@/api/apiUtils";
import { API_URL } from "@/config";
import { AIModel, ModelSortKey } from "@/features/models";

/** Načte modely seřazené podle zvoleného řazení (seřadí Hugging Face přes vlastní server). */
export const getModels = async (sort: ModelSortKey): Promise<AIModel[]> => {

    const response = await fetch(`${API_URL}/api/models?sort=${sort}`, {
        method: "GET",
    });

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
