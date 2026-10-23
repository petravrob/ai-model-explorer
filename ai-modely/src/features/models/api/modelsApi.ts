import { handleApiResponse } from "@/api/apiUtils";
import { API_URL } from "@/config";
import { AIModel, ModelFilters, ModelInsights } from "@/features/models";
import { MODELS_PER_PAGE } from "../modelPagingConfig";
import type { ModelSortKey } from "../modelSortsConfig";
import type { ModelTabKey } from "../modelTabsConfig";

/** Jedna stránka výpisu a informace, jestli jsou na serveru další. */
export interface ModelsPage {
    models: AIModel[];
    hasMore: boolean;
    nextCursor: string | null;
}

/** Odkud stránku načíst - navázáním na kurzor, nebo od zadané pozice. */
export interface ModelsPaging {
    offset?: number;
    limit?: number;
    cursor?: string | null;
}

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

/** Načte stránku modelů podle filtrů, štítku a řazení. */
export const getModels = async (
    filters?: ModelFilters,
    sort?: ModelSortKey,
    tab?: ModelTabKey,
    paging: ModelsPaging = {},
    signal?: AbortSignal
): Promise<ModelsPage> => {

    const params = filters ? new URLSearchParams(buildFiltersQuery(filters).slice(1)) : new URLSearchParams();

    if (sort) {
        params.set("sort", sort);
    }

    if (tab) {
        params.set("tab", tab);
    }

    // Server vrátí jen požadovanou část výpisu a k tomu, jestli má další (meta.hasMore)
    params.set("offset", String(paging.offset ?? 0));
    params.set("limit", String(paging.limit ?? MODELS_PER_PAGE));

    // Kurzor z předchozí odpovědi má přednost; server ho pošle jen u jednoho výpisu
    if (paging.cursor) {
        params.set("cursor", paging.cursor);
    }

    const response = await fetch(
        `${API_URL}/api/models?${params.toString()}`,
        {
            method: "GET",
            signal,
        }
    );

    const data = await handleApiResponse<AIModel[]>(
        response,
        "Nepodařilo se načíst modely."
    );

    return {
        models: data.data as AIModel[],
        hasMore: data.meta?.hasMore === true,
        nextCursor: typeof data.meta?.nextCursor === "string" ? data.meta.nextCursor : null,
    };
};


// Probíhající a hotové dotazy na avatary autorů – stejný autor se stahuje jen jednou
const avatarRequests = new Map<string, Promise<string | null>>();

/** Načte adresu avataru autora ze serveru (na pozadí, neblokuje výpis modelů). */
export const getAuthorAvatar = async (
    author: string
): Promise<string | null> => {

    const pendingRequest = avatarRequests.get(author);

    if (pendingRequest) {
        return pendingRequest;
    }

    const request = (async (): Promise<string | null> => {

        try {

            const response = await fetch(
                `${API_URL}/api/models/avatar/${encodeURIComponent(author)}`,
                { method: "GET" }
            );

            const data = await handleApiResponse<{ avatarUrl: string | null }>(
                response,
                "Nepodařilo se načíst avatar."
            );

            return (data.data as { avatarUrl: string | null }).avatarUrl;

        } catch {

            // Avatar není podstatný – při chybě zůstane zástupný obrázek modelu
            return null;

        }
    })();

    avatarRequests.set(author, request);

    return request;
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

/** Připraví české přehledy z dokumentace modelu (jednou na verzi dokumentace). */
export const getModelInsights = async (
    modelId: string
): Promise<ModelInsights | null> => {

    const response = await fetch(
        `${API_URL}/api/models/${encodeURIComponent(modelId)}/insights`,
        {
            method: "POST",
        }
    );

    const data = await handleApiResponse<{ modelId: string; insights: ModelInsights | null }>(
        response,
        "Nepodařilo se připravit přehledy z dokumentace."
    );

    return (data.data as { insights: ModelInsights | null }).insights;
};

/** Nechá vygenerovat popisky pro modely, které jsou na stránce vidět. */
export const createDescriptions = async (
    models: AIModel[]
): Promise<{ modelId: string; description: string }[]> => {

    const response = await fetch(`${API_URL}/api/models/descriptions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ models }),
    });

    const data = await handleApiResponse<{ modelId: string; description: string }[]>(
        response,
        "Nepodařilo se vygenerovat popisky."
    );

    return data.data as { modelId: string; description: string }[];
};
