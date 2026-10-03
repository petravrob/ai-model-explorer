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

// Štítky nad výpisem modelů: určují, ze kterého výpisu Hugging Face se modely vybírají.
// Výpis podle popularity se používá jen pro štítek "vše" (odpovídá zvolenému řazení),
// každý další štítek má vlastní výpis, aby se obsah štítků neopakoval.
// Hodnoty jsou klíče řazení z SORT_PARAMS, null znamená běžný výpis podle zvoleného řazení.
const TAB_SORT_KEYS = {
    all: null,
    recommended: "downloads",
    new: "created",
    trending: "likes",
    local: "downloads",
    server: "downloads",
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
    "trendingScore",
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

// Horní mez čekání na avatar (jeden pomalý autor nesmí zdržet celý výpis modelů)
const AVATAR_BUDGET_MS = 10000;

// Adresa vyhrazeného avatar endpointu Hugging Face (rychlá, bez stahování celé stránky autora)
const HF_AVATAR_API_URL = "https://huggingface.co/api/avatars";

// Na CDN doméně leží skutečně nahrané avatary; huggingface.co/avatars/…
const AVATAR_CDN_HOST = "cdn-avatars.huggingface.co";

/**
 * Načte avatar autora přes vyhrazený avatar endpoint (302 přesměrování na CDN).
 * Vrátí adresu nahraného avataru, nebo null když autor modelu žádný nemá.
 */
async function fetchAuthorAvatarUrl(author) {
    try {
        const response = await fetch(
            `${HF_AVATAR_API_URL}/${encodeURIComponent(author)}`,
            {
                redirect: "manual",
                signal: AbortSignal.timeout(AVATAR_BUDGET_MS),
            }
        );

        // Přesměrování na CDN znamená nahraný avatar; identicon (huggingface.co/avatars) ignorujeme
        if (response.status >= 300 && response.status < 400) {
            const location = response.headers.get("location") ?? "";

            return location.includes(AVATAR_CDN_HOST) ? location : null;
        }

        // autor bez avataru (404 apod.)
        return null;
    } catch (error) {
        console.error(`Avatar autora „${author}“ se nepodařilo načíst: ${error.message}`);

        return null;
    }
}

// Avataři jsou cachovány, aby se nezjišťovaly při každém zobrazení modelů.
const AVATAR_CACHE_LIMIT = 500;

// Pokud je avatar platný, tak se o něj požádá za delší dobu (7 dní)
const AVATAR_TTL_MS = 7 * 24 * 60 * 60 * 1000;
// Pokud avatar byl nedostupný, tak se o něj požádá dříve (1 den), 
const AVATAR_MISS_TTL_MS = 24 * 60 * 60 * 1000;

const avatarCache = new Map();

/** Vrátí adresu avataru autora (z paměti, jinak ji zjistí na Hugging Face). */
async function getAuthorAvatarUrl(author) {
    const cached = avatarCache.get(author);

    if (cached && cached.expiresAt > Date.now()) {
        return cached.avatarUrl;
    }

    const avatarUrl = await fetchAuthorAvatarUrl(author);

    // Aby paměť nebyla přetížená, tak se cache vyprázdní
    if (avatarCache.size >= AVATAR_CACHE_LIMIT) {
        avatarCache.clear();
    }

    avatarCache.set(author, {
        avatarUrl,
        expiresAt: Date.now() + (avatarUrl ? AVATAR_TTL_MS : AVATAR_MISS_TTL_MS),
    });

    return avatarUrl;
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

/** Sestaví adresu výpisu modelů seřazeného podle zvoleného klíče (volitelně zúženého na úlohu). */
function buildSortedListUrl(sortParam, limit, task) {
    const url = new URL(HF_MODELS_API_URL);

    url.searchParams.set("sort", sortParam);
    url.searchParams.set("direction", "-1");
    url.searchParams.set("limit", String(limit));

    // Zúžení na úlohu se předá přímo Hugging Face, aby filtrování
    // neprobíhalo až nad malým celkovým výpisem (méně časté úlohy by jinak nic nenašly)
    if (task) {
        url.searchParams.set("pipeline_tag", task);
    }

    for (const field of EXPAND_FIELDS) {
        url.searchParams.append("expand[]", field);
    }

    return url.toString();
}

/** Načte surová data nejpopulárnějších modelů z Hugging Face (nejstaženější modely každé úlohy). */
async function getModels({ tasks = DEFAULT_TASKS, limitPerTask = DEFAULT_MODELS_PER_TASK } = {}) {
    // Úlohy se stahují souběžně, pořadí výsledků odpovídá pořadí úloh
    const taskResults = await Promise.all(
        tasks.map((task) => fetchJson(buildListUrl(task, limitPerTask)))
    );

    return taskResults.flat();
}

/** Načte kompletní seznam modelů z Hugging Face s live daty pro lokální filtraci na serveru. */
async function getAllModels(limit = DEFAULT_SORT_LIMIT) {
    return fetchJson(buildSortedListUrl(SORT_PARAMS.downloads, limit));
}

/** Načte modely z Hugging Face seřazené podle klíče z API (např. popularity), volitelně zúžené na jednu úlohu. */
async function getSortedModels(sort, limit = DEFAULT_SORT_LIMIT, task) {
    return fetchJson(buildSortedListUrl(SORT_PARAMS[sort], limit, task));
}

/** Načte surová data jednoho konkrétního modelu z Hugging Face podle jeho identifikátoru. */
async function getModel(modelId) {
    return fetchJson(`${HF_MODELS_API_URL}/${modelId}`);
}

// Text model card (README) se mění jen zřídka, proto se hotové texty drží v paměti
const CARD_CACHE_LIMIT = 200;

// Delší karta se zkracuje, aby se na stránku neposílaly zbytečně velké texty
const MAX_CARD_LENGTH = 50000;

const cardCache = new Map();

/** Načte text model card (README) modelu z Hugging Face (nebo null, když ji model nemá). */
async function getModelCard(modelId) {
    if (cardCache.has(modelId)) {
        return cardCache.get(modelId);
    }

    let content = null;

    try {
        const markdown = await fetchText(`${HF_BASE_URL}/${modelId}/raw/main/README.md`);

        // YAML hlavička se na Hugging Face nezobrazuje, proto se odstraní
        content = markdown
            .replace(/^\s*---\r?\n[\s\S]*?\r?\n---\r?\n?/, "")
            .slice(0, MAX_CARD_LENGTH)
            .trim();
    } catch {
        // Model card nemá nebo se ji nepodařilo načíst
    }

    // Aby paměť nerostla, při přeplnění se cache vyprázdní
    if (cardCache.size >= CARD_CACHE_LIMIT) {
        cardCache.clear();
    }

    // Neúspěch se neukládá, aby se karta zkusila i při příští návštěvě
    if (content) {
        cardCache.set(modelId, content);
    }

    return content;
}

module.exports = {
    DEFAULT_TASKS,
    SORT_PARAMS,
    TAB_SORT_KEYS,
    getModel,
    getModelCard,
    getModels,
    getAllModels,
    getSortedModels,
    getAuthorPageHtml,
    getAuthorAvatarUrl,
};

