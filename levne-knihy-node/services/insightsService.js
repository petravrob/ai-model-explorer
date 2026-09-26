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

const ModelInsights = require("../models/ModelInsights");
const { getModelCard } = require("./huggingFaceService");
const { requestCompletion } = require("./aiCompletion");

// Kolik znaků dokumentace se nejvýš posílá ke zpracování (delší text by jen zdržoval).
// Tabulky s benchmarky bývají až v druhé půlce karty, proto je rozpočet štědřejší.
const MAX_EXCERPT_LENGTH = 6000;

// Příliš krátká dokumentace nemívá co nabídnout
const MIN_DOCUMENTATION_LENGTH = 300;

// Nejvýš tolik položek v jednotlivých seznamech
const MAX_ITEMS = 6;

// Nejvýš tolik výsledků benchmarků (delší výčty už jsou jen na opis)
const MAX_BENCHMARKS = 12;

// Nadpisy, u kterých se dá čekat užitečná informace (včetně oddílů s výsledky měření)
const RELEVANT_SECTION = /(overview|introduc|about|descript|highlight|capab|feature|use case|usage|quick ?start|inferenc|deploy|serv|framework|context|limitation|caveat|restriction|out of scope|known|why|benchmark|evaluat|performance|result|score|metric|leaderboard|model|train|architect)/i;

// Nadpisy, které naopak jen zabírají místo
const SKIP_SECTION = /(citation|bibtex|acknowledg|changelog|version histor|references|star history)/i;

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
        '  "overview": "1–2 věty o tom, co model je a k čemu slouží",',
        '  "bestFor": ["oblasti použití, které dokumentace výslovně zmiňuje"],',
        '  "useCases": ["konkrétní typy použití z dokumentace (např. přepis schůzek, shrnování dokumentů)"],',
        '  "capabilities": ["konkrétní schopnosti, které dokumentace výslovně zmiňuje"],',
        '  "modalities": ["druhy vstupů a výstupů, které dokumentace uvádí (text, obrázky, zvuk, video)"],',
        '  "inferenceFrameworks": ["frameworky a nástroje pro nasazení zmíněné v dokumentaci"],',
        '  "contextLength": "délka kontextu přesně tak, jak ji dokumentace uvádí",',
        '  "architecture": "stručně architektura, pokud ji dokumentace uvádí (např. MoE, decoder-only)",',
        '  "trainingMethod": "způsob tréninku, pokud ho dokumentace výslovně uvádí (např. destilace, RL)",',
        '  "variants": ["varianty nebo velikosti modelu, které dokumentace uvádí (např. 7B / 13B)"],',
        '  "recommendedSettings": ["konkrétní doporučené hodnoty z dokumentace (např. temperature 0.7, top_p 0.8)"],',
        '  "limitations": ["omezení, výhrady nebo důležitá upozornění z dokumentace"],',
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
        "- nejvýš 6 položek v každém seznamu",
        "- u benchmarků uváděj jen výsledky, které dokumentace výslovně zmiňuje; jinak nech seznam prázdný",
        "- výsledky jednotlivých benchmarků nikdy neslučuj a nepočítej z nich žádné celkové skóre ani pořadí",
        "- pokud dokumentace označuje měření za vlastní, interní nebo jinak vymezené, napiš to do pole context",
        "- nejvýš 12 benchmarků",
        "- u benchmarků překládej jen oblast (např. kódování, matematika, obecné znalosti); názvy benchmarků, metriky a způsob měření nech v původní podobě",
        "- do useCases patří konkrétní použití (např. přepis schůzek), do capabilities obecné schopnosti (např. práce s kódem)",
        "- do modalities piš česky druhy vstupů a výstupů (text, obrázky, zvuk, video)",
        "- architecture a trainingMethod vyplň jen tehdy, když je dokumentace výslovně uvádí; jinak nech null",
        "- variants a recommendedSettings jen když dokumentace uvádí konkrétní varianty nebo doporučené hodnoty",
        "",
        "DOKUMENTACE MODELU:",
        "---",
        excerpt,
        "---",
    ].join("\n");
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

    const flush = () => {
        if (isRelevant && current.length > 0) {
            parts.push(current.join("\n"));
        }

        current = [];
    };

    for (const line of documentation.split("\n")) {
        const heading = line.match(/^#{1,3}\s+(.*)$/);

        if (heading) {
            flush();

            // První nadpis je název modelu – text pod ním patří k úvodu, proto se bere vždy
            isRelevant = isFirstHeading
                || (RELEVANT_SECTION.test(heading[1]) && !SKIP_SECTION.test(heading[1]));

            isFirstHeading = false;
        }

        current.push(line);
    }

    flush();

    return parts.join("\n\n").slice(0, MAX_EXCERPT_LENGTH);
}

const PROMPT_VERSION = "v7";

/**
 * Vytvoří otisk vstupu, ze kterého přehledy vznikají (verze zadání + dokumentace).
 * Když otisk nesedí s uloženým, dokumentace se zpracuje znovu.
 */
function createFingerprint(documentation) {
    return crypto.createHash("sha1").update(`${PROMPT_VERSION}\n${SYSTEM_PROMPT}\n${documentation}`).digest("hex").slice(0, 16);
}

/** Převede hodnotu na krátký text (nebo null, když nic neobsahuje). */
function toText(value) {
    const text = typeof value === "string" ? value.trim() : "";

    return text.length > 0 && text.toLowerCase() !== "null" ? text : null;
}

/** Převede hodnotu na krátký seznam bez duplicit. */
function toList(value) {
    const items = Array.isArray(value) ? value : [value];

    const cleaned = items
        .map((item) => String(typeof item === "string" ? item : (item?.name ?? item?.label ?? "")).trim().slice(0, 120))
        .filter(Boolean);

    return [...new Set(cleaned)].slice(0, MAX_ITEMS);
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
            overview: toText(parsed.overview),
            bestFor: toList(parsed.bestFor),
            useCases: toList(parsed.useCases),
            capabilities: toList(parsed.capabilities),
            modalities: toList(parsed.modalities),
            inferenceFrameworks: toList(parsed.inferenceFrameworks),
            contextLength: toText(parsed.contextLength),
            architecture: toText(parsed.architecture),
            trainingMethod: toText(parsed.trainingMethod),
            variants: toList(parsed.variants),
            recommendedSettings: toList(parsed.recommendedSettings),
            limitations: toList(parsed.limitations),
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
        overview: doc.overview ?? null,
        bestFor: doc.bestFor ?? [],
        useCases: doc.useCases ?? [],
        capabilities: doc.capabilities ?? [],
        modalities: doc.modalities ?? [],
        inferenceFrameworks: doc.inferenceFrameworks ?? [],
        contextLength: doc.contextLength ?? null,
        architecture: doc.architecture ?? null,
        trainingMethod: doc.trainingMethod ?? null,
        variants: doc.variants ?? [],
        recommendedSettings: doc.recommendedSettings ?? [],
        limitations: doc.limitations ?? [],
        benchmarks: (doc.benchmarks ?? []).map((item) => ({
            name: item.name,
            score: item.score ?? null,
            metric: item.metric ?? null,
            category: item.category ?? null,
            context: item.context ?? null,
        })),
    };
}

// Modely, u kterých právě běží zpracování dokumentace
const pendingInsights = new Set();

/**
 * Vrátí české přehledy k modelu - z databáze, nebo je nechá připravit z dokumentace.
 * Stejný vstup (verze zadání + dokumentace) se zpracovává jen jednou.
 */
async function generateInsights(modelId) {
    const documentation = await getModelCard(modelId);

    if (!documentation || documentation.length < MIN_DOCUMENTATION_LENGTH) {
        return null;
    }

    const sourceFingerprint = createFingerprint(documentation);
    const stored = await ModelInsights.findOne({ modelId });

    // Přehledy z tohoto vstupu už máme
    if (stored && stored.sourceFingerprint === sourceFingerprint) {
        return toInsights(stored);
    }

    const excerpt = selectRelevantParts(documentation);

    if (excerpt.length < MIN_DOCUMENTATION_LENGTH) {
        return stored ? toInsights(stored) : null;
    }

    // Stejný model se nezpracovává víckrát, dokud nedoběhne předchozí pokus
    if (pendingInsights.has(modelId)) {
        return stored ? toInsights(stored) : null;
    }

    pendingInsights.add(modelId);

    try {
        const data = await requestCompletion({
            system: SYSTEM_PROMPT,
            prompt: buildPrompt(excerpt),
            temperature: 0.3,
            maxTokens: 2000,
        });

        const insights = parseInsights(data?.choices?.[0]?.message?.content);

        if (!insights) {
            console.error(`Přehledy modelu „${modelId}“ se nepodařilo přečíst z odpovědi.`);

            return stored ? toInsights(stored) : null;
        }

        await ModelInsights.updateOne(
            { modelId },
            { $set: { ...insights, sourceFingerprint } },
            { upsert: true }
        );

        return insights;
    } catch (error) {
        console.error(`Přehledy modelu „${modelId}“ se nepodařilo vytvořit: ${error.message}`);

        return stored ? toInsights(stored) : null;
    } finally {
        pendingInsights.delete(modelId);
    }
}

module.exports = {
    generateInsights,
};
