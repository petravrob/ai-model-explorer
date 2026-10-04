/**
 * Přehledy z dokumentace modelu (README z Hugging Face).
 *
 * Z dokumentace se vyberou jen části, které nesou užitečné informace (úvod, schopnosti,
 * použití, kontext, omezení) a ty se přeloží a zestruční do češtiny. Hotové přehledy se
 * ukládají do databáze, takže se stejná dokumentace nezpracovává víckrát.
 *
 * Model bez dokumentace, bez klíče k AI nebo s nepoužitelnou dokumentací vrátí null
 * stránka pak funguje dál jen se základními údaji.
 */

const crypto = require("node:crypto");

const AIModel = require("../models/AIModel");
const { getModelCard } = require("./huggingFaceService");
const { requestCompletion } = require("./aiCompletion");

// Kolik znaků dokumentace se nejvýš posílá ke zpracování (delší text by jen zdržoval).
// Tabulky s benchmarky a doporučeným nastavením bývají až v druhé půlce karty.
const MAX_EXCERPT_LENGTH = 7000;

// Příliš krátká dokumentace nemívá co nabídnout
const MIN_DOCUMENTATION_LENGTH = 300;

// Nejvýš tolik položek v jednotlivých seznamech
const MAX_ITEMS = 6;

// Omezení se nevypisují na kartu, proto se jich vejde víc
const MAX_LIMITATIONS = 12;

// Konkrétních scénářů použití se vejde do sekce víc než běžných položek
const MAX_USE_CASES = 8;

// Nejvýš tolik výsledků benchmarků (delší výčty už jsou jen na opis)
const MAX_BENCHMARKS = 24;

// Nejvýš tolik obrázků, videí a tabulek se z dokumentace použije
const MAX_IMAGES = 6;
const MAX_VIDEOS = 2;

// Adresy videí, která se dají přehrát přímo v prohlížeči
const VIDEO_EXTENSION = /\.(mp4|webm|mov|m4v|ogv)($|\?)/i;

// Odkazy na YouTube (watch, youtu.be, embed, shorts)
const YOUTUBE_LINK = /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{6,})/i;

// Obrázky, které patří k repozitáři, ne k modelu (štítky, loga, avatary, statistiky)
const IGNORED_IMAGE = /(badge|shield|logo|icon|favicon|avatar|star|trend|visitor|counter|commit|pypi|npm|conda|colab|discord|twitter)/i;

// Nadpisy, u kterých se dá čekat užitečná informace (včetně výsledků měření a praktických údajů)
const RELEVANT_SECTION = /(overview|introduc|about|descript|highlight|capab|feature|use case|usage|quick ?start|inferenc|deploy|serv|framework|context|limitation|caveat|restriction|out of scope|known|issue|why|benchmark|evaluat|performance|result|score|metric|leaderboard|model|train|finetun|distill|architect|licen|requirement|hardware|vram|quantiz|compatib|format|api|releas|note)/i;

// Nadpisy, které naopak jen zabírají místo
const SKIP_SECTION = /(citation|bibtex|acknowledg|changelog|version histor|references|star history|install|setup|discord|community|social|contents)/i;

// Oddíly s výsledky měření - u dlouhých dokumentací se nesmí ztratit
const BENCHMARK_SECTION = /(benchmark|evaluat|performance|result|score|metric|leaderboard)/i;

const SYSTEM_PROMPT = [
    "Jsi editor českého katalogu AI modelů.",
    "Z anglické dokumentace modelu vytahuješ jen to, co v ní skutečně stojí, a předáváš to česky.",
    "Všechny popisy, schopnosti a oblasti použití piš česky – například „generování obrázků z textu“,",
    "„rozpoznávání řeči v reálném čase“, „práce s programovacím kódem“ nebo „uvažování a řešení problémů“.",
    "Anglicky zůstávají jen vlastní názvy: modely a repozitáře, knihovny a frameworky (Transformers, vLLM,",
    "SGLang, PyTorch, Docker), benchmarky (MMLU, SWE-bench), příkazy, kód, adresy a identifikátory.",
    "Nic si nevymýšlíš, nic nedohaduješ a nic nepřikrášluješ.",
    "Výsledky benchmarků přebíráš přesně a nikdy je neslučuješ ani z nich nepočítáš pořadí, průměr nebo celkové skóre.",
    "Piš přirozenou spisovnou češtinou, stručně a věcně.",
].join(" ");

/** Sestaví zadání pro zpracování dokumentace. */
function buildPrompt(excerpt) {
    return [
        "Z anglické dokumentace modelu vytvoř český přehled pro detail modelu v katalogu.",
        "",
        "Vrať pouze JSON v tomto tvaru (bez dalšího vysvětlování):",
        "{",
        '  "highlights": ["3–7 konkrétních vlastností, které model odlišují (schopnosti, architektura, délka kontextu, multimodalita, rychlost, podporovaná workflow, způsob tréninku, vlastnosti nasazení)"],',
        '  "bestFor": ["oblasti použití, které dokumentace výslovně zmiňuje"],',
        '  "useCases": ["4–8 konkrétních praktických scénářů odvozených z dokumentace (např. asistent pro psaní kódu, dávkový přepis porad, úprava fotografií)"],',
        '  "capabilities": ["konkrétní schopnosti, které dokumentace výslovně zmiňuje"],',
        '  "modalities": ["druhy vstupů a výstupů, které dokumentace uvádí (text, obrázky, zvuk, video)"],',
        '  "inferenceFrameworks": ["frameworky, nástroje a služby pro nasazení a použití, které dokumentace výslovně zmiňuje"],',
        '  "contextLength": "délka kontextu přesně tak, jak ji dokumentace uvádí",',
        '  "activeParameters": "aktivní parametry u modelů typu MoE přesně podle dokumentace (např. 2,7 B), jinak null",',
        '  "architecture": "stručně architektura, pokud ji dokumentace uvádí (např. MoE, decoder-only)",',
        '  "trainingMethod": "způsob tréninku, pokud ho dokumentace výslovně uvádí (např. destilace, RL)",',
        '  "version": "verze nebo označení vydání, pokud je dokumentace uvádí",',
        '  "baseModel": "model, ze kterého tento vychází, pokud to dokumentace uvádí",',
        '  "variants": ["varianty nebo velikosti modelu, které dokumentace uvádí (např. 7B / 13B)"],',
        '  "recommendedSettings": ["doporučené hodnoty z dokumentace (počet kroků, CFG, sampler, temperature a podobně)"],',
        '  "hardwareRequirements": ["nároky na provoz modelu, které dokumentace uvádí (např. 24 GB VRAM, CUDA) – ne hardware použitý při tréninku"],',
        '  "quantization": ["kvantizace nebo formáty, které dokumentace uvádí (např. fp16, int8, GGUF, safetensors)"],',
        '  "compatibility": ["s čím je model kompatibilní nebo co vyžaduje (verze knihoven, operační systémy, související modely)"],',
        '  "limitations": ["všechna významná omezení, výhrady a upozornění z dokumentace"],',
        '  "benchmarks": [',
        "    {",
        '      "name": "název benchmarku (např. MMLU, GSM8K, SWE-bench)",',
        '      "score": "výsledek přesně tak, jak ho dokumentace uvádí (např. 78,5 nebo 62,3 %)",',
        '      "metric": "metrika, pokud ji dokumentace uvádí (např. accuracy, pass@1)",',
        '      "category": "oblast, pokud ji dokumentace uvádí (např. kódování, matematika, obecné znalosti)",',
        '      "context": "jen pokud dokumentace uvádí, jak se měřilo (např. vlastní hodnocení autorů, 5-shot, s nástroji)"',
        "    }",
        "  ]",
        "}",
        "",
        "PRAVIDLA:",
        "- všechny popisné položky piš česky; anglické nech jen vlastní názvy a názvy nástrojů",
        "- co v dokumentaci není, nech prázdné (null nebo prázdné pole), nic nedomýšlej",
        "- položky piš krátce (2–6 slov) a věcně, bez hodnocení a bez doporučování",
        "- frameworky, názvy modelů a délku kontextu zachovej přesně jako v dokumentaci",
        "- dodrž počty: highlights 3–7 bodů, useCases 4–8 bodů",
        "- nejvýš 6 položek v ostatních seznamech (u omezení nejvýš 12, u benchmarků nejvýš 24)",
        "- vše piš konkrétně k tomuto modelu; obecné fráze typu „vhodný pro širokou škálu úloh“ nepatří nikam",
        "- nevypisuj obecně známé údaje (např. požadavky na Python nebo CUDA), pokud je dokumentace výslovně neuvádí",
        "- highlights ať vystihují to, čím se model liší od ostatních, ne co umí každý podobný model",
        "- useCases odvozuj z dokumentace (např. „asistent pro psaní kódu“, „dávkový přepis porad“); co v dokumentaci není, nedopisuj",
        "- z příkladů použití vytáhni jen podstatnou informaci (např. doporučené hodnoty), kód nikdy nekopíruj",
        "- neuváděj citace, odkazy na komunitu, instalační návody ani marketingové slogany",
        "- projdi oddíly Limitations, Caveats, Known issues, Out of scope a licenční podmínky a vezmi z nich všechna významná omezení",
        "- neuváděj jako omezení to, že něco v dokumentaci chybí (např. chybějící licence nebo testy)",
        "- licence a její praktická omezení patří do limitations",
        "- version, baseModel, quantization a compatibility vyplň jen tehdy, když dokumentace uvádí konkrétní informaci",
        "- u benchmarků uváděj jen výsledky, které dokumentace výslovně zmiňuje; jinak nech seznam prázdný",
        "- výsledky ber i z tabulek: pokud má tabulka víc modelů, použij sloupec tohoto modelu",
        "- oblast (category) ber z nadpisu tabulky nebo skupiny řádků (např. „Standard Benchmarks“ → standardní benchmarky)",
        "- výsledky jednotlivých benchmarků nikdy neslučuj a nepočítej z nich žádné celkové skóre ani pořadí",
        "- pokud dokumentace označuje měření za vlastní, interní nebo jinak vymezené, napiš to do pole context",
        "- nejvýš 12 benchmarků",
        "- u benchmarků překládej jen oblast (např. kódování, matematika, obecné znalosti); názvy benchmarků, metriky a způsob měření nech v původní podobě",
        "- do useCases patří konkrétní použití (např. přepis schůzek), do capabilities obecné schopnosti (např. práce s kódem)",
        "- do modalities piš česky druhy vstupů a výstupů (text, obrázky, zvuk, video)",
        "- architecture a trainingMethod vyplň jen tehdy, když je dokumentace výslovně uvádí; jinak nech null",
        "- variants a recommendedSettings jen když dokumentace uvádí konkrétní varianty nebo doporučené hodnoty",
        "- activeParameters vyplň jen u modelů typu MoE a jen tehdy, když dokumentace aktivní parametry uvádí; jinak nech null",
        "- do limitations patří všechna významná omezení, která dokumentace výslovně uvádí (i prakticky důležité omezení licence)",
        "- do hardwareRequirements patří jen nároky na provoz modelu, ne hardware použitý při tréninku",
        "",
        "DOKUMENTACE MODELU:",
        "---",
        excerpt,
        "---",
    ].join("\n");
}

/** Ořeže text na rozpočet, ale nikdy neprostřed řádku (rozbité řádky tabulek se nedají přečíst). */
function cutAtLine(text, limit) {
    if (text.length <= limit) {
        return text;
    }

    const cut = text.slice(0, limit);
    const lastBreak = cut.lastIndexOf("\n");

    return lastBreak > 0 ? cut.slice(0, lastBreak) : cut;
}

/** Převede cestu k obrázku na úplnou adresu v repozitáři modelu. */
function toAbsoluteImageUrl(url, modelId) {
    if (/^https?:\/\//i.test(url)) {
        return url;
    }

    return `https://huggingface.co/${modelId}/resolve/main/${url.replace(/^\.?\//, "")}`;
}

/**
 * Vytáhne z dokumentace obrázky, které o modelu něco říkají.
 * Bere se pořadí z dokumentace a jako popisek nadpis, pod kterým obrázek stojí.
 * Nic se nedomýšlí – obrázky ani popisky nevymýšlí AI.
 */
function extractImages(documentation, modelId) {
    const images = [];
    let heading = "";

    for (const line of documentation.split("\n")) {
        const title = line.match(/^#{1,4}\s+(.*)$/);

        if (title) {
            heading = title[1].trim().replace(/\s+/g, " ").slice(0, 120);
            continue;
        }

        const pattern = /!\[([^\]]*)\]\(([^)\s]+)[^)]*\)|<img[^>]*src=["']([^"']+)["'][^>]*>/gi;

        for (const match of line.matchAll(pattern)) {
            const alt = (match[1] ?? "").trim().replace(/\s+/g, " ").slice(0, 120);
            const url = (match[2] || match[3] || "").trim();

            // Štítky, loga a odkazy na videa do obrázků nepatří
            if (!url || IGNORED_IMAGE.test(url) || VIDEO_EXTENSION.test(url) || /\.svg($|\?)/i.test(url)) {
                continue;
            }

            const absolute = toAbsoluteImageUrl(url, modelId);

            if (images.some((image) => image.url === absolute)) {
                continue;
            }

            images.push({ url: absolute, alt, caption: heading });

            if (images.length >= MAX_IMAGES) {
                return images;
            }
        }
    }

    return images;
}

/** Rozpozná video a vrátí jeho adresu i případný náhledový obrázek. */
function videoFromUrl(url, title, modelId) {
    const youtube = url.match(YOUTUBE_LINK);

    if (youtube) {
        return {
            url: `https://www.youtube.com/watch?v=${youtube[1]}`,
            title,
            thumbnail: `https://i.ytimg.com/vi/${youtube[1]}/hqdefault.jpg`,
        };
    }

    if (VIDEO_EXTENSION.test(url)) {
        return { url: toAbsoluteImageUrl(url, modelId), title, thumbnail: "" };
    }

    return null;
}

/**
 * Vytáhne z dokumentace videa - přehratelná přímo i odkazy na YouTube.
 * Jako popisek se používá text odkazu, nebo nadpis, pod kterým video stojí.
 */
function extractVideos(documentation, modelId) {
    const videos = [];
    let heading = "";

    const push = (url, title) => {
        const video = videoFromUrl(url, title || heading, modelId);

        if (video && !videos.some((item) => item.url === video.url)) {
            videos.push(video);
        }
    };

    for (const line of documentation.split("\n")) {
        const title = line.match(/^#{1,4}\s+(.*)$/);

        if (title) {
            heading = title[1].trim().replace(/\s+/g, " ").slice(0, 120);
            continue;
        }

        // Přehrávač přímo v dokumentaci
        for (const match of line.matchAll(/<(?:video|source)[^>]*src=["']([^"']+)["']/gi)) {
            push(match[1], heading);
        }

        // Vložený přehrávač (např. z YouTube)
        for (const match of line.matchAll(/<iframe[^>]*src=["']([^"']+)["']/gi)) {
            push(match[1], heading);
        }

        // Odkazy na video – markdown i prosté adresy
        for (const match of line.matchAll(/\[([^\]]*)\]\(([^)\s]+)[^)]*\)|(https?:\/\/[^\s)<>"']+)/gi)) {
            push(match[2] || match[3] || "", (match[1] ?? "").trim() || heading);
        }

        if (videos.length >= MAX_VIDEOS) {
            break;
        }
    }

    return videos;
}

/**
 * Vybere z dokumentace jen části, které mají cenu zpracovávat.
 * Bere se úvod a oddíly o schopnostech, použití, kontextu a omezeních.
 */
function selectRelevantParts(documentation) {
    const parts = [];

    let current = [];
    let isRelevant = true;
    let isFirstHeading = true;

    // Úroveň nadpisu, pod kterou jde o výsledky měření (i v pododdílech)
    let benchmarkLevel = null;
    let partBenchmark = false;

    const flush = () => {
        if (isRelevant && current.length > 0) {
            parts.push({ text: current.join("\n"), isBenchmark: partBenchmark });
        }

        current = [];
    };

    for (const line of documentation.split("\n")) {
        const heading = line.match(/^(#{1,3})\s+(.*)$/);

        if (heading) {
            flush();

            const level = heading[1].length;
            const title = heading[2];

            // Tabulky mívají pododdíly (např. podle velikosti modelu), které se dědí
            if (BENCHMARK_SECTION.test(title)) {
                benchmarkLevel = level;
            } else if (benchmarkLevel !== null && level <= benchmarkLevel) {
                benchmarkLevel = null;
            }

            partBenchmark = benchmarkLevel !== null;

            // První nadpis je název modelu – text pod ním patří k úvodu, proto se bere vždy
            isRelevant = isFirstHeading
                || (RELEVANT_SECTION.test(title) && !SKIP_SECTION.test(title));

            isFirstHeading = false;
        }

        current.push(line);
    }

    flush();

    const textOf = (items) => items.map((part) => part.text).join("\n\n");

    // Na výsledky měření zůstává vyhrazená část rozpočtu, aby se neořezaly se zbytkem
    const benchmarkText = cutAtLine(
        textOf(parts.filter((part) => part.isBenchmark)),
        Math.floor(MAX_EXCERPT_LENGTH / 2)
    );

    const mainText = cutAtLine(
        textOf(parts.filter((part) => !part.isBenchmark)),
        MAX_EXCERPT_LENGTH - benchmarkText.length
    );

    return [mainText, benchmarkText].filter(Boolean).join("\n\n");
}

const PROMPT_VERSION = "v18";

/**
 * Vytvoří otisk vstupu, ze kterého přehledy vznikají (verze zadání + dokumentace).
 * Když otisk nesedí s uloženým, dokumentace se zpracuje znovu.
 */
function createFingerprint(documentation) {
    // Do otisku patří i šablona zadání, aby se přehledy přepočítaly i po změně pravidel
    const template = buildPrompt("");

    return crypto
        .createHash("sha1")
        .update(`${PROMPT_VERSION}\n${SYSTEM_PROMPT}\n${template}\n${documentation}`)
        .digest("hex")
        .slice(0, 16);
}

/** Převede hodnotu na krátký text (nebo null, když nic neobsahuje). */
function toText(value) {
    const text = typeof value === "string" ? value.trim() : "";

    return text.length > 0 && text.toLowerCase() !== "null" ? text : null;
}

/** Převede hodnotu na krátký seznam bez duplicit (u delších výčtů se limit dá zvýšit). */
function toList(value, limit = MAX_ITEMS) {
    const items = Array.isArray(value) ? value : [value];

    const cleaned = items
        .map((item) => String(typeof item === "string" ? item : (item?.name ?? item?.label ?? "")).trim().slice(0, 160))
        .filter(Boolean);

    return [...new Set(cleaned)].slice(0, limit);
}

/** Převede výsledek benchmarku na krátký text (může dorazit i jako číslo). */
function toScore(value) {
    const text = toText(typeof value === "object" ? (value?.value ?? "") : String(value ?? ""));

    return text?.slice(0, 40) ?? null;
}

// Oblasti benchmarků, které dokumentace uvádějí anglicky
const CATEGORY_LABELS = new Map([
    ["reasoning", "uvažování"],
    ["math", "matematika"],
    ["mathematics", "matematika"],
    ["code", "kódování"],
    ["coding", "kódování"],
    ["code generation", "generování kódu"],
    ["factual knowledge", "faktické znalosti"],
    ["general knowledge", "obecné znalosti"],
    ["reading comprehension", "porozumění textu"],
    ["common sense", "zdravý rozum"],
    ["multilingual", "vícejazyčné úlohy"],
    ["tool use", "práce s nástroji"],
    ["safety", "bezpečnost"],
]);

/** Převede oblast benchmarku na český název, když je v dokumentaci anglicky. */
function toCategory(value) {
    const text = toText(value);

    return text ? (CATEGORY_LABELS.get(text.toLowerCase()) ?? text.slice(0, 60)) : null;
}

/** Převede benchmarky z odpovědi AI na krátké položky s názvem a výsledkem. */
function toBenchmarks(value) {
    const items = Array.isArray(value) ? value : [];

    const cleaned = items.map((item) => ({
        name: toText(item?.name)?.slice(0, 80) ?? null,
        score: toScore(item?.score),
        metric: toText(item?.metric)?.slice(0, 60) ?? null,
        category: toCategory(item?.category),
        context: toText(item?.context)?.slice(0, 120) ?? null,
    }));

    // Záznam bez názvu a výsledku nemá cenu a stejné dvojice se neopakují
    return cleaned
        .filter((item) => item.name && item.score)
        .filter((item, index) => cleaned.findIndex((other) => other.name === item.name && other.score === item.score) === index)
        .slice(0, MAX_BENCHMARKS);
}

/** Převede odpověď AI na přehledy, nebo vrátí null, když se odpověď nedá použít. */
function parseInsights(raw) {
    const text = String(raw ?? "");
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");

    if (start < 0 || end <= start) {
        return null;
    }

    try {
        const parsed = JSON.parse(text.slice(start, end + 1));

        const insights = {
            highlights: toList(parsed.highlights),
            bestFor: toList(parsed.bestFor),
            useCases: toList(parsed.useCases, MAX_USE_CASES),
            capabilities: toList(parsed.capabilities),
            modalities: toList(parsed.modalities),
            inferenceFrameworks: toList(parsed.inferenceFrameworks),
            contextLength: toText(parsed.contextLength),
            architecture: toText(parsed.architecture),
            activeParameters: toText(parsed.activeParameters),
            trainingMethod: toText(parsed.trainingMethod),
            version: toText(parsed.version),
            baseModel: toText(parsed.baseModel),
            variants: toList(parsed.variants),
            recommendedSettings: toList(parsed.recommendedSettings),
            hardwareRequirements: toList(parsed.hardwareRequirements),
            quantization: toList(parsed.quantization),
            compatibility: toList(parsed.compatibility),
            limitations: toList(parsed.limitations, MAX_LIMITATIONS),
            benchmarks: toBenchmarks(parsed.benchmarks),
        };

        // Když se z dokumentace nic nepřečetlo, nemá smysl výsledek ukládat
        const filled = Object.values(insights);

        return filled.some((value) => (Array.isArray(value) ? value.length > 0 : Boolean(value))) ? insights : null;
    } catch {
        return null;
    }
}

/** Převede uložený záznam na data pro klienta. */
function toInsights(doc) {
    return {
        highlights: doc.highlights ?? [],
        bestFor: doc.bestFor ?? [],
        useCases: doc.useCases ?? [],
        capabilities: doc.capabilities ?? [],
        modalities: doc.modalities ?? [],
        inferenceFrameworks: doc.inferenceFrameworks ?? [],
        contextLength: doc.contextLength ?? null,
        architecture: doc.architecture ?? null,
        activeParameters: doc.activeParameters ?? null,
        trainingMethod: doc.trainingMethod ?? null,
        version: doc.version ?? null,
        baseModel: doc.baseModel ?? null,
        variants: doc.variants ?? [],
        recommendedSettings: doc.recommendedSettings ?? [],
        hardwareRequirements: doc.hardwareRequirements ?? [],
        quantization: doc.quantization ?? [],
        compatibility: doc.compatibility ?? [],
        limitations: doc.limitations ?? [],
        benchmarks: (doc.benchmarks ?? []).map((item) => ({
            name: item.name,
            score: item.score ?? null,
            metric: item.metric ?? null,
            category: item.category ?? null,
            context: item.context ?? null,
        })),
        images: (doc.images ?? []).map((item) => ({
            url: item.url,
            alt: item.alt ?? "",
            caption: item.caption ?? "",
        })),
        videos: (doc.videos ?? []).map((item) => ({
            url: item.url,
            title: item.title ?? "",
            thumbnail: item.thumbnail ?? "",
        })),
    };
}

/**
 * Uloží aspoň obrázky z dokumentace, když se texty od AI nepodaří vytvořit.
 * Otisk se záměrně neukládá, aby se texty zkusily znovu, až bude služba dostupná.
 */
async function saveVisualOnly(modelId, visual, stored) {
    const isEmpty = visual.images.length === 0 && visual.videos.length === 0;

    if (isEmpty) {
        return stored ? toInsights(stored) : null;
    }

    await AIModel.updateOne(
        { modelId },
        { $set: { "insights.images": visual.images, "insights.videos": visual.videos } }
    );

    return { ...toInsights(stored ?? {}), ...visual };
}

/**
 * Přečte uložené přehledy z databáze (bez volání AI a bez stahování dokumentace).
 * Chybějící přehledy si požadavek zařadí do fronty na pozadí (services/generationQueue).
 */
async function getStoredInsights(modelId) {
    const stored = await AIModel.findOne({ modelId }, { insights: 1 }).lean();

    return stored?.insights ? toInsights(stored.insights) : null;
}

/**
 * Připraví české přehledy k modelu z dokumentace a uloží je do databáze.
 * Stejný vstup (verze zadání + dokumentace) se zpracovává jen jednou.
 * Spouští se na pozadí z fronty úkolů, ne v požadavku klienta.
 */
async function generateInsights(modelId) {
    const documentation = await getModelCard(modelId);

    if (!documentation || documentation.length < MIN_DOCUMENTATION_LENGTH) {
        return null;
    }

    const sourceFingerprint = createFingerprint(documentation);
    const storedModel = await AIModel.findOne({ modelId }, { insights: 1 }).lean();
    const stored = storedModel?.insights ?? null;

    // Přehledy z tohoto vstupu už máme
    if (stored && stored.sourceFingerprint === sourceFingerprint) {
        return toInsights(stored);
    }

    const excerpt = selectRelevantParts(documentation);

    if (excerpt.length < MIN_DOCUMENTATION_LENGTH) {
        return stored ? toInsights(stored) : null;
    }

    // Obrázky se berou přímo z dokumentace a AI je nevymýšlí,
    // takže se dají uložit i tehdy, když se texty od AI nepodaří vytvořit.
    const visual = {
        images: extractImages(documentation, modelId),
        videos: extractVideos(documentation, modelId),
    };

    try {
        const data = await requestCompletion({
            system: SYSTEM_PROMPT,
            prompt: buildPrompt(excerpt),
            temperature: 0.3,
            maxTokens: 3500,
        });

        const insights = parseInsights(data?.choices?.[0]?.message?.content);

        if (!insights) {
            console.error(`Přehledy modelu „${modelId}“ se nepodařilo přečíst z odpovědi.`);

            return saveVisualOnly(modelId, visual, stored);
        }

        await AIModel.updateOne(
            { modelId },
            {
                $set: {
                    insights: {
                        ...insights,
                        ...visual,
                        sourceFingerprint,
                        status: "ok",
                        generatedAt: new Date(),
                    },
                },
            }
        );

        return { ...insights, ...visual };
    } catch (error) {
        console.error(`Přehledy modelu „${modelId}“ se nepodařilo vytvořit: ${error.message}`);

        // Obrázky se uloží i tak, ale chyba se hlásí dál, aby fronta úkol odložila
        // na později (u vyčerpaného limitu poskytovatelů se fronta pozastaví)
        await saveVisualOnly(modelId, visual, stored);

        throw error;
    }
}

module.exports = {
    generateInsights,
    getStoredInsights,
};
