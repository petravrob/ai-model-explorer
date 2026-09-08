const { HUGGINGFACE_API_KEY } = require("../config/env");

const HF_MODELS_API_URL = "https://huggingface.co/api/models";

// Úlohy (pipeline tagy), na které se import soustředí
const DEFAULT_TASKS = [
    "text-generation",
    "text-to-image",
    "image-text-to-text",
    "text-to-speech",
    "automatic-speech-recognition",
];

// Kolik nejpopulárnějších modelů (podle počtu stažení) se načte pro každou úlohu
const DEFAULT_MODELS_PER_TASK = 40;

// Metadata, která se mají od Hugging Face vyžádat
const EXPAND_FIELDS = [
    "author",
    "lastModified",
    "safetensors",
    "cardData",
    "tags",
    "likes",
    "library_name",
    "pipeline_tag",
];

const REQUEST_TIMEOUT_MS = 15000;
const MAX_ATTEMPTS = 3;

/** Sestaví hlavičky pro volání Hugging Face API (token je volitelný). */
function buildHeaders() {
    const headers = {
        Accept: "application/json",
    };

    if (HUGGINGFACE_API_KEY) {
        headers.Authorization = `Bearer ${HUGGINGFACE_API_KEY}`;
    }

    return headers;
}

/** Stáhne JSON z Hugging Face API (při omezení rychlosti to párkrát zkusí znovu). */
async function fetchJson(url) {
    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
        const response = await fetch(url, {
            headers: buildHeaders(),
            signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
        });

        if (response.status === 429 && attempt < MAX_ATTEMPTS) {
            await new Promise((resolve) => setTimeout(resolve, attempt * 2000));
            continue;
        }

        if (!response.ok) {
            throw new Error(`Hugging Face API vrátila chybu ${response.status}.`);
        }

        return response.json();
    }
}

/** Vyhledá licenci v datech modelu (cardData, případně štítky). */
function extractLicense(rawModel) {
    const license = rawModel?.cardData?.license;

    if (typeof license === "string" && license.length > 0) {
        return license;
    }

    if (Array.isArray(license) && license.length > 0) {
        return license[0];
    }

    const licenseTag = (rawModel?.tags ?? []).find((tag) => tag.startsWith("license:"));

    return licenseTag ? licenseTag.slice("license:".length) : null;
}

/** Převede surová data z Hugging Face na tvar AIModel schématu. */
function mapModelData(rawModel = {}) {
    const modelId = rawModel.id ?? rawModel.modelId ?? null;
    const segments = typeof modelId === "string" ? modelId.split("/") : [];

    return {
        modelId,
        name: segments.length > 0 ? segments[segments.length - 1] : null,
        author: rawModel.author ?? (segments.length > 1 ? segments[0] : null),
        task: rawModel.pipeline_tag ?? null,
        parameters: rawModel.safetensors?.total ?? null,
        downloads: rawModel.downloads ?? 0,
        likes: rawModel.likes ?? 0,
        tags: rawModel.tags ?? [],
        license: extractLicense(rawModel),
        library: rawModel.library_name ?? null,
        lastModified: rawModel.lastModified ? new Date(rawModel.lastModified) : null,
        url: modelId ? `https://huggingface.co/${modelId}` : null,
    };
}

/** Sestaví adresu výpisu nejpopulárnějších modelů pro danou úlohu. */
function buildListUrl(task, limitPerTask) {
    const url = new URL(HF_MODELS_API_URL);

    url.searchParams.set("pipeline_tag", task);
    url.searchParams.set("sort", "downloads");
    url.searchParams.set("direction", "-1");
    url.searchParams.set("limit", String(limitPerTask));

    for (const field of EXPAND_FIELDS) {
        url.searchParams.append("expand[]", field);
    }

    return url.toString();
}

/** Načte nejpopulárnější modely z Hugging Face (nejstaženější modely každé úlohy). */
async function getModels({ tasks = DEFAULT_TASKS, limitPerTask = DEFAULT_MODELS_PER_TASK } = {}) {
    const models = [];
    const seenModelIds = new Set();

    for (const task of tasks) {
        const rawModels = await fetchJson(buildListUrl(task, limitPerTask));

        for (const rawModel of rawModels) {
            const model = mapModelData(rawModel);

            // Bez klíčových údajů nemá smysl model ukládat, duplicity přeskočíme
            if (!model.modelId || !model.task || seenModelIds.has(model.modelId)) {
                continue;
            }

            seenModelIds.add(model.modelId);
            models.push(model);
        }
    }

    return models;
}

/** Načte jeden konkrétní model z Hugging Face podle jeho identifikátoru. */
async function getModel(modelId) {
    const rawModel = await fetchJson(`${HF_MODELS_API_URL}/${modelId}`);

    return mapModelData(rawModel);
}

module.exports = {
    DEFAULT_TASKS,
    getModels,
    getModel,
};
