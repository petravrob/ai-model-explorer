import { handleApiResponse } from "@/api/apiUtils";
import { API_URL } from "@/config";
import { AIModel } from "@/features/models";

/** Načte všechny inzeráty. */
export const getModels = async (): Promise<AIModel[]> => {

    const response = await fetch(`${API_URL}/`, {
        method: "GET",
    });

    const data = await handleApiResponse<AIModel[]>(
        response,
        "Nepodařilo se načíst inzeráty."
    );

    return data.data as AIModel[];
};


/** Načte jeden inzerát podle jeho identifikátoru. */
export const getModel = async (
    modelId: string
): Promise<AIModel> => {

    const response = await fetch(
        `${API_URL}/model/${modelId}`,
        {
            method: "GET",
        }
    );

    const data = await handleApiResponse<AIModel>(
        response,
        "Nepodařilo se načíst inzerát."
    );

    return data.data as AIModel;
}; 
