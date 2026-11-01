const mongoose = require("mongoose");

const AIModel = require("../models/AIModel");
const { DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE, LANGUAGE_FILTER_OVERFETCH, MAX_PAGE_OFFSET } = require("../config/paging");
const {
    SORT_PARAMS,
    TAB_SORT_KEYS,
    PARAMETER_RANGES,
    getModel: fetchHuggingFaceModel,
    getModelCard: fetchHuggingFaceCard,
    getSortedModels,
    getAuthorAvatarUrl,
} = require("../services/huggingFaceService");
const { isValidModel, mapModelData, mapRawModels } = require("../services/modelMapper");
const { getStoredDescriptions } = require("../services/descriptionService");
const { getStoredInsights } = require("../services/insightsService");
const { enqueueJobs } = require("../services/generationQueue");
const { ensureModelsStored, saveAuthorAvatar } = require("../services/modelStore");

/**
 * Porovnávací funkce pro sloučený výpis podle zvoleného řazení.
 * Výchozí je podle počtu stažení; trendingScore nemusejí mít všechny modely,
 * proto chybějící hodnotu nahradí počtem stažení jako rozumným odhadem popularity.
 */
const SORT_COMPARATORS = {
    popularity: (a, b) => (b.trendingScore ?? b.downloads) - (a.trendingScore ?? a.downloads),
    downloads: (a, b) => b.downloads - a.downloads,
    likes: (a, b) => b.likes - a.likes,
    created: (a, b) => new Date(b.publishedAt ?? 0) - new Date(a.publishedAt ?? 0),
};

/** Seřadí sloučené modely podle zvoleného klíče (neznámý klíč = podle počtu stažení). */
const sortMergedModels = (models, sort) =>
    [...models].sort(SORT_COMPARATORS[sort] ?? SORT_COMPARATORS.downloads);

/* Řazení modelů v databázi */
const STORED_SORTS = {
    popularity: { trendingScore: -1, downloads: -1 },
    downloads: { downloads: -1 },
    likes: { likes: -1 },
    created: { publishedAt: -1 },
};

/**
 * Sestaví dotaz do databáze ze zvolených filtrů (podobně jako filtry pro Hugging Face).
 */
const buildStoredQuery = ({ tasks, languages, libraries, licenses, authors, parameterRanges }) => {

    const conditions = [];

    if (tasks.length > 0) {
        conditions.push({ task: { $in: tasks } });
    }

    // Jazyky umí vyhodnotit jen databáze, Hugging Face je neumí filtrovat
    if (languages.length > 0) {
        conditions.push({ languages: { $in: languages } });
    }

    // Knihovna může být uložená jako název knihovny i jako štítek modelu
    if (libraries.length > 0) {
        conditions.push({
            $or: [
                { library: { $in: libraries } },
                { tags: { $in: libraries } },
            ],
        });
    }

    if (licenses.length > 0) {
        conditions.push({ license: { $in: licenses } });
    }

    if (authors.length > 0) {
        conditions.push({ author: { $in: authors } });
    }

    // Velikost modelu je v databázi uložená jako počet parametrů, rozsahy odpovídají filtrům
    const ranges = parameterRanges
        .map((value) => PARAMETER_RANGES[value])
        .filter(Boolean);

    if (ranges.length > 0) {
        conditions.push({
            $or: ranges.map(({ min, max }) => ({
                parameters: max === null ? { $gte: min } : { $gte: min, $lt: max },
            })),
        });
    }

    return conditions.length > 0 ? { $and: conditions } : {};
};

/** Převede opakovatelný parametr dotazu na pole hodnot (např. „?tasks=a&tasks=b“). */
const toArrayParam = (param) => {

    if (Array.isArray(param)) {
        return param.filter((value) => typeof value === "string" && value.length > 0);
    }

    return typeof param === "string" && param.length > 0 ? [param] : [];
};

/** Přečte celočíselný parametr stránkování (neplatná hodnota se nahradí výchozí). */
const readPageParam = (value, fallback, min, max) => {

    const parsed = Number.parseInt(value, 10);

    return Number.isInteger(parsed)
        ? Math.min(Math.max(parsed, min), max)
        : fallback;
};

// Kolik kombinací zvolených filtrů se maximálně pošle na Hugging Face. Hodnoty v každé
// kategorii se načítají zvlášť, takže při velkém výběru by požadavků rychle přibývalo.
const MAX_FILTER_QUERIES = 12;

/**
 * Vytvoří kombinace zvolených hodnot filtrů pro dotazy na Hugging Face.
 * Prázdná kategorie výpis neomezuje, proto má prázdnou hodnotu.
 */
const buildFilterQueries = ({ libraries, licenses, authors, parameterRanges }) => {

    const dimensions = [libraries, licenses, authors, parameterRanges].map(
        (values) => values.length > 0 ? values : [null]
    );

    const combinations = dimensions.reduce(
        (queries, values) => queries.flatMap((query) => values.map((value) => [...query, value])),
        [[]]
    );

    return combinations.slice(0, MAX_FILTER_QUERIES).map(
        ([library, license, author, parameters]) => ({ library, license, author, parameters })
    );
};

/**
 * Načte modely z Hugging Face pro všechny kombinace zvolených filtrů.
 */
const fetchModelPages = (queries, sort, limit, paging) =>
    Promise.all(
        queries.map(({ task, ...filters }) => getSortedModels(sort, limit, task, paging, filters))
    );

/** Vyfiltruje modely podle jazyků (Hugging Face podle nich filtrovat neumí). */
const filterByLanguages = (models, languages) =>
    languages.length > 0
        ? models.filter((model) =>
            model.languages.some((language) => languages.includes(language))
        )
        : models;

/** Kolik modelů se z Hugging Face stáhlo (podle toho se posouvá pozice pro další stránku). */
const fetchedRawCount = (pages) =>
    pages.reduce((count, page) => Math.max(count, page.models.length), 0);

/**
 * Načte stránku modelů z Hugging Face a srovná je podle zvoleného řazení.
 * Bez jazykového filtru stačí jeden dotaz na každou kombinaci filtrů. S jazykovým filtrem se
 * stránka naplňuje po menších částech, protože část modelů jazyk nesplní.
 */
const fetchFilteredPage = async (queries, poolSort, sort, pageLimit, languages, paging) => {

    // Bez jazykového filtru se stáhne rovnou celá stránka pro každou kombinaci filtrů
    if (languages.length === 0) {

        const pages = await fetchModelPages(queries, poolSort, pageLimit, paging);

        return {
            models: sortMergedModels(
                mapRawModels(pages.flatMap((page) => page.models).filter(Boolean)),
                sort
            ).slice(0, pageLimit),
            hasMore: pages.some((page) => page.hasMore),
            // Kurzor na další stránku, u víc kombinací se cursory rozcházejí, proto se nepoužije
            nextCursor: queries.length > 1 ? null : pages[0]?.nextCursor ?? null,
            nextOffset: paging.skip + fetchedRawCount(pages),
        };
    }

    const models = [];
    const seenModelIds = new Set();

    // Kolik modelů už bylo přeskočeno (podle toho naváže další stránka)
    let rawConsumed = 0;
    let cursor = paging.cursor ?? null;
    let hasMore = false;

    // Stahuje se po kolech na základě chybějících modelů vyhovujících jazykovému filtru
    for (let round = 0; round < LANGUAGE_FILTER_OVERFETCH && models.length < pageLimit; round++) {

        // Vždy chybí jen tolik modelů, kolik se jich ještě nevešlo do stránky
        const missing = pageLimit - models.length;

        // Kurzor platí pro jeden výpis, u víc kombinací filtrů se stránkuje přeskočením
        const roundPaging = cursor ? { cursor } : { skip: paging.skip + rawConsumed };

        const pages = await fetchModelPages(queries, poolSort, missing, roundPaging);
        const roundRaw = fetchedRawCount(pages);

        hasMore = pages.some((page) => page.hasMore);
        cursor = queries.length > 1 ? null : pages[0]?.nextCursor ?? null;

        // Bere se jen tolik modelů, kolik se jich stáhlo, takže se žádný nepřeskočí
        filterByLanguages(
            mapRawModels(pages.flatMap((page) => page.models).filter(Boolean)),
            languages
        ).forEach((model) => {
            if (!seenModelIds.has(model.modelId)) {
                seenModelIds.add(model.modelId);
                models.push(model);
            }
        });

        rawConsumed += roundRaw;

        // Prázdná část znamená, že na Hugging Face už nejsou další vyhovující modely
        if (roundRaw === 0) {
            break;
        }
    }

    return {
        // Víc kombinací filtrů vrátí dohromady víc modelů, do stránky jich patří jen pageLimit
        models: sortMergedModels(models, sort).slice(0, pageLimit),
        hasMore,
        nextCursor: cursor,
        // Pozice pro navázání další stránky (při stránkování kurzorem se místo ní použije kurzor)
        nextOffset: paging.skip + rawConsumed,
    };
};

/** Načte model živě z Hugging Face a převede ho na tvar AIModel (když neexistuje, vrátí null). */
const getHuggingFaceModel = async (modelId) => {

    try {
        const model = mapModelData(await fetchHuggingFaceModel(modelId));

        return isValidModel(model) ? model : null;
    } catch (error) {
        console.error(`Model „${modelId}“ se nepodařilo načíst z Hugging Face: ${error.message}`);

        return null;
    }
};

/** Převod modelu na správný tvar pro renderování. */
const toApiModel = (model) => ({
    ...model,
    createdAt: model.publishedAt ?? null,
    description: model.description?.text ?? null,
});

/**
 * Doplní k modelům právě načteným z Hugging Face popisky uložené v databázi.
 * Popisky, které v databázi ještě nejsou, si klient vyžádá zvlášť a server je dogeneruje na pozadí.
 */
const withStoredDescriptions = async (models) => {
    const stored = new Map(
        (await getStoredDescriptions(models.map((model) => model.modelId)))
            .map((item) => [item.modelId, item.description])
    );

    return models.map((model) =>
        stored.has(model.modelId)
            ? { ...model, description: { text: stored.get(model.modelId) } }
            : model
    );
};

/**
 * Načte stránku modelů uložených v databázi (naplněno importem) podle dotazu z filtrů.
 * Z databáze se stránkuje přímo dotazem, takže se u ní nemusí volat Hugging Face.
 */
const fetchStoredModels = async (query, poolSort, sort, pageLimit, pageOffset) => {

    const models = await AIModel.find(query, { insights: 0 })
        .sort(STORED_SORTS[poolSort] ?? STORED_SORTS.downloads)
        .skip(pageOffset)
        .limit(pageLimit)
        .lean();

    return sortMergedModels(models, sort);
};

// Kolik částí se maximálně stáhne, aby se stránka doplnila modely, které v databází ještě nejsou
const LIVE_FILL_ROUNDS = 4;

/**
 * Doplní stránku modely, které v databází pro zvolené filtry ještě nejsou (živě z Hugging Face).
 * Už uložené modely se přeskočí, aby se stejné modely neopakovaly při dalším načtení stránky.
 * Když je v databázi jen část modelů, musí se jich z Hugging Face stáhnout víc, proto se
 * pokračuje, dokud se stránka nenaplní (nebo dokud Hugging Face něco vrací).
 */
const fetchLiveModels = async (queries, storedQuery, poolSort, sort, count, languages, startSkip, startCursor) => {

    const models = [];
    const seenModelIds = new Set();

    let skip = startSkip;
    let cursor = startCursor;
    let hasMore = false;

    for (let round = 0; round < LIVE_FILL_ROUNDS && models.length < count; round++) {

        const page = await fetchFilteredPage(queries, poolSort, sort, count - models.length, languages, { skip, cursor });

        hasMore = page.hasMore;
        cursor = page.nextCursor;
        skip = page.nextOffset;

        // Uložené modely se do stránky nepřidají, aby se výpis neopakoval
        const stored = new Set(
            (await AIModel.find(
                { ...storedQuery, modelId: { $in: page.models.map((model) => model.modelId) } },
                { modelId: 1 }
            ).lean()).map((model) => model.modelId)
        );

        page.models.forEach((model) => {
            if (!stored.has(model.modelId) && !seenModelIds.has(model.modelId)) {
                seenModelIds.add(model.modelId);
                models.push(model);
            }
        });

        // Prázdná stránka znamená, že na Hugging Face už nejsou další modely
        if (page.models.length === 0) {
            break;
        }
    }

    return { models: models.slice(0, count), hasMore, nextCursor: cursor, consumed: skip - startSkip };
};

const getModels = async (req, res) => {
    try {
        const { sort, tab } = req.query;
        const tasks = toArrayParam(req.query.tasks);
        const languages = toArrayParam(req.query.languages);

        // Filtrování Hugging Face
        const libraries = toArrayParam(req.query.library);
        const licenses = toArrayParam(req.query.license);
        const authors = toArrayParam(req.query.author);
        const parameterRanges = toArrayParam(req.query.parameters);

        // Hodnoty filtrů se mají spojit (např. dvě knihovny), ale Hugging Face
        // umí v jednom dotazu jen průnik, proto se každá kombinace načítá zvlášť
        const filterQueries = buildFilterQueries({ libraries, licenses, authors, parameterRanges });

        // Bez zvolené úlohy vstupuje do kombinace prázdná hodnota, ta výpis nijak neomezí
        const queries = (tasks.length > 0 ? tasks : [null]).flatMap((task) =>
            filterQueries.map((filters) => ({ task, ...filters }))
        );

        if (sort && !SORT_PARAMS[sort]) {
            return res.status(400).json({
                status: "error",
                error: "Neznámé řazení.",
            });
        }

        if (tab && !Object.hasOwn(TAB_SORT_KEYS, tab)) {
            return res.status(400).json({
                status: "error",
                error: "Neznámý štítek.",
            });
        }

        // Stránkování: klient si vyžádá počet modelů od zadané pozice, nebo naváže kurzorem
        const pageOffset = readPageParam(req.query.offset, 0, 0, MAX_PAGE_OFFSET);
        const pageLimit = readPageParam(req.query.limit, DEFAULT_PAGE_SIZE, 1, MAX_PAGE_SIZE);
        const cursor = typeof req.query.cursor === "string" && req.query.cursor.length > 0
            ? req.query.cursor
            : null;

        // Štítek určuje, z jakého výpisu se modely vybírají, zvolené řazení se použije nad stránkou
        const poolSort = TAB_SORT_KEYS[tab] ?? sort ?? "downloads";

        // Stránka se nejdřív vytvoří z modelů uložených v databázi.
        // Uložené modely mají popisky i avatary, takže se pro ně nic negeneruje a
        // nečeká se na Hugging Face. Chybějící modely se doplní živě z Hugging Face
        const storedQuery = buildStoredQuery({ tasks, languages, libraries, licenses, authors, parameterRanges });
        const storedTotal = await AIModel.countDocuments(storedQuery);
        const storedModels = await fetchStoredModels(storedQuery, poolSort, sort, pageLimit, pageOffset);

        // Kolik modelů ještě chybí doplnit do stránky
        const missingCount = pageLimit - storedModels.length;

        // Živě se naváže tam, kde se skončilo
        const liveSkip = Math.max(0, pageOffset - storedTotal);

        const livePage = missingCount > 0
            ? await fetchLiveModels(
                queries,
                storedQuery,
                poolSort,
                sort,
                missingCount,
                languages,
                liveSkip,
                // Kurzor platí pro jeden výpis, s víc kombinacemi filtrů se stránkuje přeskočením
                queries.length > 1 ? null : cursor
            )
            : { models: [], hasMore: false, nextCursor: null, consumed: 0 };

        // Avatary se k výpisu nedotahují - klient si je načte zvlášť na pozadí,
        // aby stahování stránek autorů nezdržovalo zobrazení modelů.
        // Ukládají se jen modely vrácené na stránce, ne celý stažený objem.
        await ensureModelsStored(livePage.models);

        // Uložené popisky se přidají rovnou k výpisu, aby se nenačítaly znovu.
        // Živé modely nemají databázové id, v adrese detailu se použije identifikátor z Hugging Face.
        const liveModels = (await withStoredDescriptions(livePage.models)).map((model) => ({
            ...model,
            _id: model._id ?? model.modelId,
            avatarUrl: model.avatarUrl ?? null,
        }));

        // Modely z databáze i z živého výpisu se sloučí a stránka se seřadí podle zvoleného řazení
        const pageModels = sortMergedModels([...storedModels, ...liveModels], sort);

        return res.status(200).json({
            status: "ok",
            data: pageModels.map(toApiModel),
            meta: {
                offset: pageOffset,
                limit: pageLimit,
                hasMore: missingCount > 0 ? livePage.hasMore : true,
                nextOffset: pageOffset + storedModels.length + livePage.consumed,
                nextCursor: livePage.nextCursor ?? null,
            },
        });
    } catch (error) {
        console.error("Fetching models failed:", error);

        return res.status(500).json({
            status: "error",
            error: "Fetching models failed.",
        });
    }
};

const getModel = async (req, res) => {
    try {
        const { modelId } = req.params;

        // Detail lze načíst podle MongoDB identifikátoru i podle id modelu na Hugging Face
        const query = mongoose.Types.ObjectId.isValid(modelId)
            ? { _id: modelId }
            : { modelId };

        let model = await AIModel.findOne(query, { insights: 0 }).lean();

        // Model, který dosud není v databázi, se zkusí načíst živě z Hugging Face
        if (!model && !mongoose.Types.ObjectId.isValid(modelId)) {
            model = await getHuggingFaceModel(modelId);

            if (model) {
                // Uloží se, aby k němu šly doplnit popisky a přehledy
                await ensureModelsStored([model]);
            }
        }

        if (!model) {
            return res.status(404).json({
                status: "error",
                error: "Model nebyl nalezen.",
            });
        }

        return res.status(200).json({
            status: "ok",
            data: toApiModel(model),
        });
    } catch (error) {
        console.error("Fetching model failed:", error);

        return res.status(500).json({
            status: "error",
            error: "Fetching model failed.",
        });
    }
};

const getAvatar = async (req, res) => {
    try {
        const { author } = req.params;

        if (!author) {
            return res.status(400).json({
                status: "error",
                error: "Chybí autor.",
            });
        }

        const avatarUrl = await getAuthorAvatarUrl(author);

        // Adresa se uloží k modelům autora, aby se příště nemusela dotahovat
        await saveAuthorAvatar(author, avatarUrl);

        return res.status(200).json({
            status: "ok",
            data: { avatarUrl },
        });
    } catch (error) {
        console.error("Fetching avatar failed:", error);

        return res.status(500).json({
            status: "error",
            error: "Fetching avatar failed.",
        });
    }
};

/**
 * Vrátí hotové popisky k modelům, které aplikace právě zobrazuje.
 * Samotné generování běží na pozadí ve frontě - požadavek jen přečte,
 * co už je v databázi, chybějící popisky zařadí ke zpracování a hned odpoví.
 */
const createDescriptions = async (req, res) => {
    try {
        const models = Array.isArray(req.body?.models) ? req.body.models : [];
        const modelIds = models.map((model) => model?.modelId).filter(Boolean);

        const descriptions = await getStoredDescriptions(modelIds);
        const readyIds = new Set(descriptions.map((item) => item.modelId));

        // Chybějící popisky se doplní na pozadí - klient je uvidí při dalším načtení
        await enqueueJobs("description", modelIds.filter((modelId) => !readyIds.has(modelId)));

        return res.status(200).json({
            status: "ok",
            data: descriptions,
        });
    } catch (error) {
        console.error("Reading descriptions failed:", error);

        return res.status(500).json({
            status: "error",
            error: "Reading descriptions failed.",
        });
    }
};

/** Načte text model card (README) modelu z Hugging Face. */
const getModelCard = async (req, res) => {
    try {
        const { modelId } = req.params;

        if (!modelId) {
            return res.status(400).json({
                status: "error",
                error: "Chybí identifikátor modelu.",
            });
        }

        const content = await fetchHuggingFaceCard(modelId);

        return res.status(200).json({
            status: "ok",
            data: { modelId, content },
        });
    } catch (error) {
        console.error("Fetching model card failed:", error);

        return res.status(500).json({
            status: "error",
            error: "Fetching model card failed.",
        });
    }
};

/**
 * Vrátí hotové přehledy z dokumentace modelu.
 * Samotná příprava běží na pozadí ve frontě - požadavek jen přečte, co už je
 * v databázi, chybějící přehledy zařadí ke zpracování a hned odpoví
 * (bez přehledů stránka funguje dál se základními údaji).
 */
const createInsights = async (req, res) => {
    try {
        const { modelId } = req.params;

        if (!modelId) {
            return res.status(400).json({
                status: "error",
                error: "Chybí identifikátor modelu.",
            });
        }

        // Adresa může obsahovat databázové id i identifikátor modelu na Hugging Face,
        // dokumentace se ale hledá podle identifikátoru z Hugging Face
        const query = mongoose.Types.ObjectId.isValid(modelId) ? { _id: modelId } : { modelId };
        const stored = await AIModel.findOne(query, { modelId: 1 }).lean();

        const resolvedModelId = stored?.modelId ?? modelId;
        const insights = await getStoredInsights(resolvedModelId);

        if (!insights) {
            // Přehledy se připraví na pozadí - klient je uvidí při dalším otevření detailu
            await enqueueJobs("insights", [resolvedModelId]);
        }

        return res.status(200).json({
            status: "ok",
            data: { modelId, insights },
        });
    } catch (error) {
        console.error("Reading insights failed:", error);

        return res.status(500).json({
            status: "error",
            error: "Reading insights failed.",
        });
    }
};

module.exports = {
    getModels,
    getModel,
    getModelCard,
    getAvatar,
    createDescriptions,
    createInsights,
};
