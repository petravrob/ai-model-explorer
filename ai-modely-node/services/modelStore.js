/**
 * Ukládání modelů zobrazených v aplikaci.
 *
 * Vygenerovaný obsah (popis a přehledy) je vložený přímo v dokumentu modelu,
 * takže model musí v databázi existovat dřív, než se k němu cokoli doplní.
 * Data proto ukládáme i u modelů právě načtených z Hugging Face.
 */

const AIModel = require("../models/AIModel");

/** Vrátí identifikátory modelů, které ještě v databázi nejsou. */
async function findMissingModelIds(models) {
    const modelIds = models.map((model) => model.modelId).filter(Boolean);

    if (modelIds.length === 0) {
        return [];
    }

    const stored = await AIModel.find({ modelId: { $in: modelIds } }, { modelId: 1 }).lean();
    const storedIds = new Set(stored.map((item) => item.modelId));

    return modelIds.filter((modelId) => !storedIds.has(modelId));
}

/**
 * Uloží modely, které v databázi chybí. U existujících dokumentů se nic nemění,
 * aby se nepřepsal už vygenerovaný popisek ani přehledy.
 */
async function ensureModelsStored(models) {
    const missingIds = new Set(await findMissingModelIds(models));

    if (missingIds.size === 0) {
        return;
    }

    const operations = models
        .filter((model) => missingIds.has(model.modelId))
        .map((model) => ({
            updateOne: {
                filter: { modelId: model.modelId },
                update: { $setOnInsert: model },
                upsert: true,
            },
        }));

    if (operations.length === 0) {
        return;
    }

    try {
        await AIModel.bulkWrite(operations, { ordered: false });
    } catch (error) {
        // Souběžné požadavky můžou ukládat stejný model, duplicitní vložení se ignoruje
        if (error?.code !== 11000 && !error?.writeErrors?.every((item) => item.err?.code === 11000)) {
            throw error;
        }
    }
}

/** Uloží adresu avataru ke všem modelům autora, kterým ještě chybí. */
async function saveAuthorAvatar(author, avatarUrl) {
    if (!author || !avatarUrl) {
        return;
    }

    await AIModel.updateMany({ author, avatarUrl: null }, { $set: { avatarUrl } });
}

module.exports = {
    ensureModelsStored,
    saveAuthorAvatar,
};
