interface ApiError {
    msg?: string;
}

export default interface ApiResponse<T> {
    status: string;
    data: T;
    token: string;
    // Doplňující informace k odpovědi (např. jestli server má další stránku)
    meta?: {
        hasMore?: boolean;
        // Kurzor, kterým se naváže na další stránku výpisu
        nextCursor?: string | null;
        // Pozice, odkud server naváže další stránkou (u jazykového filtru se liší od počtu vrácených modelů)
        nextOffset?: number;
        [key: string]: unknown;
    };
    errors?: ApiError[];
    error?: string;
}

/**Zpracuje API odpověď a v případě chyby vyhodí error s chybovou hláškou z backendu.*/
export const handleApiResponse = async <T>(
    response: Response,
    fallbackMessage: string
): Promise<ApiResponse<T>> => {

    const data: ApiResponse<T> =
        await response.json();

    if (!response.ok || data.status !== "ok") {

        const errorMessage =
            data.errors?.[0]?.msg ||
            data.error ||
            fallbackMessage;

        throw new Error(errorMessage);
    }

    return data;
};
