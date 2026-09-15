/**
 * Převod surových dat modelů z Hugging Face na tvar AIModel schématu.
 * Sdílí ho importní skript i kontroler, který načítá modely živě z Hugging Face.
 */

/** Vyhledá licenci v surových datech modelu (cardData, případně štítky). */
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

/** Vyhledá jazyky modelu v surových datech (cardData, případně štítky). */
function extractLanguages(rawModel) {
    const languages = [];

    // Jazyky můžou být v cardData jako řetězec nebo pole
    const cardLanguages = rawModel?.cardData?.language;

    if (typeof cardLanguages === "string" && cardLanguages.length > 0) {
        languages.push(cardLanguages);
    }

    if (Array.isArray(cardLanguages)) {
        languages.push(...cardLanguages.filter((language) => typeof language === "string" && language.length > 0));
    }

    // Některé modely mají jazyky i v štítcích (např. „language:en“)
    (rawModel?.tags ?? []).forEach((tag) => {

        if (typeof tag === "string" && tag.startsWith("language:")) {
            languages.push(tag.slice("language:".length));
        }
    });

    // Sjednotí velikost písmen a duplicity odstraní
    return [...new Set(languages.map((code) => code.toLowerCase()))];
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
        languages: extractLanguages(rawModel),
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

/** Zkontroluje, že model má všechna povinná data. */
function isValidModel(model) {
    return Boolean(model.modelId && model.name && model.author && model.task && model.url);
}

/** Převede surové modely na platné unikátní záznamy seřazené podle počtu stažení. */
function mapRawModels(rawModels = []) {
    const models = [];
    const seenModelIds = new Set();

    for (const rawModel of rawModels) {
        const model = mapModelData(rawModel);

        if (!isValidModel(model) || seenModelIds.has(model.modelId)) {
            continue;
        }

        seenModelIds.add(model.modelId);
        models.push(model);
    }

    return models.sort((a, b) => b.downloads - a.downloads);
}

module.exports = {
    mapModelData,
    isValidModel,
    mapRawModels,
};
