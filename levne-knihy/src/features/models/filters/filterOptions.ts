/**
 * Kategorie úloh založené na pipeline_tag Hugging Face.
*/
export const TASK_FILTER_OPTIONS = [
    {
        value: "text",
        label: "text",
        icon: "M4 7V4h16v3M9 20h6M12 4v16",
        children: [
            { value: "text-generation", label: "generování" },
            { value: "text-classification", label: "klasifikace" },
            { value: "question-answering", label: "otázky a odpovědi" },
            { value: "translation", label: "překlad" },
            { value: "summarization", label: "shrnutí" },
            { value: "token-classification", label: "extrakce informací" },
        ],
    },
    {
        value: "images",
        label: "obrázky",
        icon: "M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2zM8.5 11.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zM21 15l-5-5L5 21",
        children: [
            { value: "image-classification", label: "rozpoznávání" },
            { value: "object-detection", label: "detekce objektů" },
            { value: "image-segmentation", label: "segmentace" },
            { value: "image-to-image", label: "úprava" },
            { value: "text-to-image", label: "generování" },
            { value: "image-to-text", label: "popis obrázků" },
            { value: "text-to-3d", label: "generování 3D" },
            { value: "image-to-3d", label: "generování 3D" },
        ],
    },
    {
        value: "audio",
        label: "zvuk a řeč",
        icon: "M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3zM19 10v2a7 7 0 0 1-14 0v-2M12 19v4M8 23h8",
        children: [
            { value: "automatic-speech-recognition", label: "přepis řeči" },
            { value: "audio-classification", label: "rozpoznávání zvuků" },
            { value: "voice-activity-detection", label: "detekce řeči" },
            { value: "text-to-speech", label: "převod textu na řeč" },
            { value: "text-to-audio", label: "generování zvuku" },
            { value: "audio-to-audio", label: "úprava zvuku" },
        ],
    },
    {
        value: "video",
        label: "video",
        icon: "M23 7l-7 5 7 5V7zM3 5h11a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z",
        children: [
            { value: "text-to-video", label: "generování" },
            { value: "image-to-video", label: "generování" },
            { value: "video-classification", label: "rozpoznávání" },
            { value: "video-to-video", label: "úprava" },
            { value: "video-text-to-text", label: "analýza" },
        ],
    },
    {
        value: "documents",
        label: "dokumenty",
        icon: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M16 13H8M16 17H8M10 9H8",
        children: [
            { value: "document-question-answering", label: "otázky nad dokumenty" },
            { value: "table-question-answering", label: "otázky nad dokumenty" },
            { value: "visual-document-retrieval", label: "vyhledávání v dokumentech" },
        ],
    },
    {
        value: "search-similarity",
        label: "vyhledávání a podobnost",
        icon: "M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM21 21l-4.35-4.35",
        children: [
            { value: "sentence-similarity", label: "podobný obsah" },
            { value: "feature-extraction", label: "extrakce vlastností" },
            { value: "image-feature-extraction", label: "extrakce vlastností obrázků" },
            { value: "text-ranking", label: "řazení výsledků" },
        ],
    },
    {
        value: "multimodal",
        label: "multimodální",
        icon: "M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5",
        children: [
            { value: "image-text-to-text", label: "obrázek a text" },
            { value: "image-text-to-image", label: "obrázek a text" },
            { value: "image-text-to-video", label: "obrázek a text" },
            { value: "visual-question-answering", label: "otázky k obrázku" },
            { value: "video-text-to-text", label: "video a text" },
            { value: "any-to-any", label: "více typů obsahu" },
        ],
    },
    {
        value: "data-prediction",
        label: "data a predikce",
        icon: "M23 6l-9.5 9.5-5-5L1 18M17 6h6v6",
        children: [
            { value: "time-series-forecasting", label: "časové řady" },
            { value: "tabular-classification", label: "klasifikace dat" },
            { value: "tabular-regression", label: "predikce" },
        ],
    },
    {
        value: "robotics",
        label: "robotika",
        icon: "M6 4h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zM9 9h6v6H9zM9 1v3M15 1v3M9 20v3M15 20v3M20 9h3M20 14h3M1 9h3M1 14h3",
        children: [
            { value: "reinforcement-learning", label: "posilované učení" },
            { value: "robotics", label: "robotika" },
        ],
    },
    {
        value: "other",
        label: "ostatní",
        icon: "M12 13a1 1 0 1 0 0-2 1 1 0 0 0 0 2zM19 13a1 1 0 1 0 0-2 1 1 0 0 0 0 2zM5 13a1 1 0 1 0 0-2 1 1 0 0 0 0 2z",
        children: [
            { value: "graph-ml", label: "grafová data" },
        ],
    },
] as const;

/** Nejčastější jazyky používané v model exploreru. */
export const LANGUAGE_FILTER_OPTIONS = [
    { value: "cs", label: "čeština" },
    { value: "zh", label: "čínština" },
    { value: "en", label: "angličtina" },
    { value: "fr", label: "francouzština" },
    { value: "ja", label: "japonština" },
    { value: "ko", label: "korejština" },
    { value: "de", label: "němčina" },
    { value: "ru", label: "ruština" },
    { value: "es", label: "španělština" },
] as const;

/**
 * Rozsahy velikostí modelů podle počtu parametrů.
 */
export const PARAMETER_FILTER_OPTIONS = [
    { value: "0-1B", label: "Do 1 B parametrů" },
    { value: "1-7B", label: "1–7 B" },
    { value: "7-13B", label: "7–13 B" },
    { value: "13-30B", label: "13–30 B" },
    { value: "30-70B", label: "30–70 B" },
    { value: "70B+", label: "Více než 70 B" },
] as const;

/** Autoři / organizace. */
export const AUTHOR_FILTER_OPTIONS = [
    { value: "01-ai", label: "01.AI" },
    { value: "CohereLabs", label: "Cohere" },
    { value: "EleutherAI", label: "EleutherAI" },
    { value: "google", label: "Google" },
    { value: "huggingface", label: "Hugging Face" },
    { value: "ibm-granite", label: "IBM" },
    { value: "meta-llama", label: "Meta" },
    { value: "microsoft", label: "Microsoft" },
    { value: "mistralai", label: "Mistral AI" },
    { value: "nvidia", label: "NVIDIA" },
    { value: "openai", label: "OpenAI" },
    { value: "Qwen", label: "Qwen (Alibaba)" },
    { value: "stabilityai", label: "Stability AI" },
] as const;
