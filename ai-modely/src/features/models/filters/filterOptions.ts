/**
 * Kategorie úloh založené na pipeline_tag Hugging Face.
 * Popisky jsou překladové klíče v namespace models (viz translateFilterOptions).
 */
export const TASK_FILTER_OPTIONS = [
    {
        value: "text",
        labelKey: "tasks.text.label",
        icon: "M4 7V4h16v3M9 20h6M12 4v16",
        children: [
            { value: "text-generation", labelKey: "tasks.text.options.text-generation" },
            { value: "text-classification", labelKey: "tasks.text.options.text-classification" },
            { value: "question-answering", labelKey: "tasks.text.options.question-answering" },
            { value: "translation", labelKey: "tasks.text.options.translation" },
            { value: "summarization", labelKey: "tasks.text.options.summarization" },
            { value: "token-classification", labelKey: "tasks.text.options.token-classification" },
        ],
    },
    {
        value: "images",
        labelKey: "tasks.images.label",
        icon: "M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2zM8.5 11.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zM21 15l-5-5L5 21",
        children: [
            { value: "text-to-image", labelKey: "tasks.images.options.text-to-image" },
            { value: "image-classification", labelKey: "tasks.images.options.image-classification" },
            { value: "image-to-text", labelKey: "tasks.images.options.image-to-text" },
            { value: "object-detection", labelKey: "tasks.images.options.object-detection" },
            { value: "image-segmentation", labelKey: "tasks.images.options.image-segmentation" },
            { value: "image-to-image", labelKey: "tasks.images.options.image-to-image" },
            { value: "text-to-3d", labelKey: "tasks.images.options.text-to-3d" },
            { value: "image-to-3d", labelKey: "tasks.images.options.image-to-3d" },
        ],
    },
    {
        value: "audio",
        labelKey: "tasks.audio.label",
        icon: "M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3zM19 10v2a7 7 0 0 1-14 0v-2M12 19v4M8 23h8",
        children: [
            { value: "automatic-speech-recognition", labelKey: "tasks.audio.options.automatic-speech-recognition" },
            { value: "text-to-speech", labelKey: "tasks.audio.options.text-to-speech" },
            { value: "audio-classification", labelKey: "tasks.audio.options.audio-classification" },
            { value: "text-to-audio", labelKey: "tasks.audio.options.text-to-audio" },
            { value: "voice-activity-detection", labelKey: "tasks.audio.options.voice-activity-detection" },
            { value: "audio-to-audio", labelKey: "tasks.audio.options.audio-to-audio" },
        ],
    },
    {
        value: "video",
        labelKey: "tasks.video.label",
        icon: "M23 7l-7 5 7 5V7zM3 5h11a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z",
        children: [
            { value: "text-to-video", labelKey: "tasks.video.options.text-to-video" },
            { value: "image-to-video", labelKey: "tasks.video.options.image-to-video" },
            { value: "video-text-to-text", labelKey: "tasks.video.options.video-text-to-text" },
            { value: "video-classification", labelKey: "tasks.video.options.video-classification" },
            { value: "video-to-video", labelKey: "tasks.video.options.video-to-video" },
        ],
    },
    {
        value: "documents",
        labelKey: "tasks.documents.label",
        icon: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M16 13H8M16 17H8M10 9H8",
        children: [
            { value: "document-question-answering", labelKey: "tasks.documents.options.document-question-answering" },
            { value: "table-question-answering", labelKey: "tasks.documents.options.table-question-answering" },
            { value: "visual-document-retrieval", labelKey: "tasks.documents.options.visual-document-retrieval" },
        ],
    },
    {
        value: "search-similarity",
        labelKey: "tasks.search-similarity.label",
        icon: "M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM21 21l-4.35-4.35",
        children: [
            { value: "feature-extraction", labelKey: "tasks.search-similarity.options.feature-extraction" },
            { value: "sentence-similarity", labelKey: "tasks.search-similarity.options.sentence-similarity" },
            { value: "text-ranking", labelKey: "tasks.search-similarity.options.text-ranking" },
            { value: "image-feature-extraction", labelKey: "tasks.search-similarity.options.image-feature-extraction" },
        ],
    },
    {
        value: "multimodal",
        labelKey: "tasks.multimodal.label",
        icon: "M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5",
        children: [
            { value: "image-text-to-text", labelKey: "tasks.multimodal.options.image-text-to-text" },
            { value: "visual-question-answering", labelKey: "tasks.multimodal.options.visual-question-answering" },
            { value: "image-text-to-image", labelKey: "tasks.multimodal.options.image-text-to-image" },
            { value: "image-text-to-video", labelKey: "tasks.multimodal.options.image-text-to-video" },
            { value: "video-text-to-text", labelKey: "tasks.multimodal.options.video-text-to-text" },
            { value: "any-to-any", labelKey: "tasks.multimodal.options.any-to-any" },
        ],
    },
    {
        value: "data-prediction",
        labelKey: "tasks.data-prediction.label",
        icon: "M23 6l-9.5 9.5-5-5L1 18M17 6h6v6",
        children: [
            { value: "time-series-forecasting", labelKey: "tasks.data-prediction.options.time-series-forecasting" },
            { value: "tabular-classification", labelKey: "tasks.data-prediction.options.tabular-classification" },
            { value: "tabular-regression", labelKey: "tasks.data-prediction.options.tabular-regression" },
        ],
    },
    {
        value: "robotics",
        labelKey: "tasks.robotics.label",
        icon: "M6 4h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zM9 9h6v6H9zM9 1v3M15 1v3M9 20v3M15 20v3M20 9h3M20 14h3M1 9h3M1 14h3",
        children: [
            { value: "reinforcement-learning", labelKey: "tasks.robotics.options.reinforcement-learning" },
            { value: "robotics", labelKey: "tasks.robotics.options.robotics" },
        ],
    },
    {
        value: "other",
        labelKey: "tasks.other.label",
        icon: "M12 13a1 1 0 1 0 0-2 1 1 0 0 0 0 2zM19 13a1 1 0 1 0 0-2 1 1 0 0 0 0 2zM5 13a1 1 0 1 0 0-2 1 1 0 0 0 0 2z",
        children: [
            { value: "graph-ml", labelKey: "tasks.other.options.graph-ml" },
        ],
    },
] as const;

/** Nejčastější jazyky používané v model exploreru. */
export const LANGUAGE_FILTER_OPTIONS = [
    { value: "cs", labelKey: "languages.cs" },
    { value: "zh", labelKey: "languages.zh" },
    { value: "en", labelKey: "languages.en" },
    { value: "fr", labelKey: "languages.fr" },
    { value: "ja", labelKey: "languages.ja" },
    { value: "ko", labelKey: "languages.ko" },
    { value: "de", labelKey: "languages.de" },
    { value: "ru", labelKey: "languages.ru" },
    { value: "es", labelKey: "languages.es" },
] as const;

/**
 * Rozsahy velikostí modelů podle počtu parametrů.
 */
export const PARAMETER_FILTER_OPTIONS = [
    { value: "0-1B", labelKey: "parameterRanges.0-1B" },
    { value: "1-7B", labelKey: "parameterRanges.1-7B" },
    { value: "7-13B", labelKey: "parameterRanges.7-13B" },
    { value: "13-30B", labelKey: "parameterRanges.13-30B" },
    { value: "30-70B", labelKey: "parameterRanges.30-70B" },
    { value: "70B+", labelKey: "parameterRanges.70B+" },
] as const;

/** Autoři / organizace (názvy značek se nepřekládají). */
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

/** Knihovny, ve kterých se modely nejčastěji používají (library_name na Hugging Face). */
export const LIBRARY_FILTER_OPTIONS = [
    { value: "transformers", label: "Transformers" },
    { value: "diffusers", label: "Diffusers" },
    { value: "sentence-transformers", label: "Sentence Transformers" },
    { value: "timm", label: "Timm" },
    { value: "keras", label: "Keras" },
    { value: "pytorch", label: "PyTorch" },
] as const;

/** Licence, které modely uvádějí nejčastěji. */
export const LICENSE_FILTER_OPTIONS = [
    { value: "apache-2.0", label: "Apache 2.0" },
    { value: "mit", label: "MIT" },
    { value: "cc-by-4.0", label: "CC BY 4.0" },
    { value: "cc-by-nc-4.0", label: "CC BY-NC 4.0" },
    { value: "openrail", label: "OpenRAIL" },
    { value: "creativeml-openrail-m", label: "CreativeML OpenRAIL-M" },
    { value: "llama3", label: "Llama 3" },
    { value: "gemma", label: "Gemma" },
] as const;
