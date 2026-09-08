import { handleApiResponse } from "@/api/apiUtils";
import { API_URL } from "@/config";
import { AIModel } from "@/features/models";

/** Načte všechny modely. */
export const getModels = async (): Promise<AIModel[]> => {

    const response = await fetch(`${API_URL}/api/models`, {
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
