const { HUGGINGFACE_API_KEY } = require("../config/env");

const HF_MODELS_API_URL = "https://huggingface.co/api/models";

// Základní adresa Hugging Face (stránky autorů pro avatary)
const HF_BASE_URL = "https://huggingface.co";

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

// Řazení výpisu z API přeložené na parametr Hugging Face
const SORT_PARAMS = {
    popularity: "trendingScore",
    downloads: "downloads",
    likes: "likes",
    created: "createdAt",
};

// Kolik modelů se načte pro seřazený výpis
const DEFAULT_SORT_LIMIT = 100;

// Metadata, která se mají od Hugging Face vyžádat
const EXPAND_FIELDS = [
    "author",
    "createdAt",
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

/** Stáhne odpověď z Hugging Face (při omezení rychlosti to párkrát zkusí znovu). */
async function fetchFromHuggingFace(url) {
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
            throw new Error(`Hugging Face vrátila chybu ${response.status}.`);
        }

        return response;
    }
}

/** Stáhne JSON z Hugging Face API. */
async function fetchJson(url) {
    const response = await fetchFromHuggingFace(url);

    return response.json();
}

/** Stáhne textový obsah z Hugging Face. */
async function fetchText(url) {
    const response = await fetchFromHuggingFace(url);

    return response.text();
}

/** Načte HTML stránku autora na Hugging Face (kvůli avataru). */
async function getAuthorPageHtml(author) {
    return fetchText(`${HF_BASE_URL}/${author}`);
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

/** Sestaví adresu výpisu modelů seřazeného podle zvoleného klíče */
function buildSortedListUrl(sortParam, limit) {
    const url = new URL(HF_MODELS_API_URL);

    url.searchParams.set("sort", sortParam);
    url.searchParams.set("direction", "-1");
    url.searchParams.set("limit", String(limit));

    for (const field of EXPAND_FIELDS) {
        url.searchParams.append("expand[]", field);
    }

    return url.toString();
}

/** Načte surová data nejpopulárnějších modelů z Hugging Face (nejstaženější modely každé úlohy). */
async function getModels({ tasks = DEFAULT_TASKS, limitPerTask = DEFAULT_MODELS_PER_TASK } = {}) {
    const rawModels = [];

    for (const task of tasks) {
        const taskModels = await fetchJson(buildListUrl(task, limitPerTask));

        rawModels.push(...taskModels);
    }

    return rawModels;
}

/** Načte modely z Hugging Face seřazené podle klíče z API (např. popularity). */
async function getSortedModels(sort, limit = DEFAULT_SORT_LIMIT) {
    return fetchJson(buildSortedListUrl(SORT_PARAMS[sort], limit));
}

/** Načte surová data jednoho konkrétního modelu z Hugging Face podle jeho identifikátoru. */
async function getModel(modelId) {
    return fetchJson(`${HF_MODELS_API_URL}/${modelId}`);
}

module.exports = {
    DEFAULT_TASKS,
    SORT_PARAMS,
    getModel,
    getModels,
    getSortedModels,
    getAuthorPageHtml,
};

