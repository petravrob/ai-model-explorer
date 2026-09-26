import { createElement, type ReactNode } from "react";

/**
 * Převod textu o modelu z Hugging Face na React prvky
 *
 * Text se zbaví HTML a rozdělí se na bloky (nadpisy, seznamy, tabulky, kód, citace,
 * odstavce), které se vykreslují zvlášť.
 */

// Adresy, které se smí stát odkazem nebo obrázkem
const SAFE_URL = /^(https?:\/\/|mailto:|data:image\/)/i;
const OTHER_SCHEME = /^[a-z][\w+.-]*:/i;

// Entity, které se v textech karet objevují
const ENTITIES: Record<string, string> = {
    "&amp;": "&", "&lt;": "<", "&gt;": ">", "&quot;": "\"", "&#39;": "'", "&nbsp;": " ",
};

// Řádkové značky - silnější musí být před slabšími, jinak by je rozbily
const INLINE = [
    "\\[\\s*!\\[([^\\[\\]]*)\\]\\(([^)]+)\\)\\s*\\]\\(([^)]+)\\)",   // obrázek v odkazu
    "!\\[([^\\[\\]]*)\\]\\(([^)]+)\\)",                              // obrázek
    "\\[([^\\[\\]]*)\\]\\(([^)]+)\\)",                               // odkaz
    "`([^`]+)`",                                                     // kód
    "\\*\\*([^*]+)\\*\\*", "__([^_]+)__",                            // tučné písmo
    "(?<![A-Za-z0-9])\\*([^*\\n]+)\\*(?![A-Za-z0-9])",               // kurzíva
    "(?<![A-Za-z0-9])_([^_\\n]+)_(?![A-Za-z0-9])",
    "<(https?://[^>\\s]+)>",                                         // adresa v ostrých závorkách
].join("|");

// Řádky, kterými začíná jiný blok než odstavec - oddělí bloky i bez prázdného řádku
const BLOCK_START = /^\s*(?:```|~~~|#{1,6}\s|>|\||[-*+]\s|\d+[.)]\s|(?:[-*_]\s*){3,})/;

// Položka seznamu (odsazení udává vnoření)
const LIST_ITEM = /^(\s*)([-*+]|\d+[.)])\s+(.*)$/;

/** Převede adresu na bezpečnou (doplní podle repozitáře modelu). */
function safeUrl(url: string, base: string): string | null {
    const trimmed = url.trim();

    if (SAFE_URL.test(trimmed)) return trimmed;
    if (OTHER_SCHEME.test(trimmed)) return null;

    try {
        return new URL(trimmed, base).href;
    } catch {
        return null;
    }
}

/** Zpracuje řádkové značky (odkazy, obrázky, kód, zvýraznění) na reactí prvky. */
function renderInline(text: string, base: string): ReactNode[] {
    const pattern = new RegExp(INLINE, "g");
    const nodes: ReactNode[] = [];

    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = pattern.exec(text)) !== null) {
        const [
            , linkedAlt, linkedSrc, linkedHref,
            alt, src, linkText, linkHref,
            code, bold, boldAlt, italic, italicAlt, autolink,
        ] = match;

        if (match.index > lastIndex) nodes.push(text.slice(lastIndex, match.index));

        const key = match.index;
        const image = src ? safeUrl(src, base) : null;
        const target = linkHref ? safeUrl(linkHref, base) : null;

        if (linkedSrc) {
            // Obrázek vložený do odkazu
            nodes.push(
                <a className="model-readme__link" href={safeUrl(linkedHref, base) ?? undefined} key={key}>
                    <img className="model-readme__image" src={safeUrl(linkedSrc, base) ?? ""} alt={linkedAlt} loading="lazy" />
                </a>
            );
        } else if (src) {
            nodes.push(image
                ? <img className="model-readme__image" src={image} alt={alt} key={key} loading="lazy" />
                : alt);
        } else if (linkHref) {
            nodes.push(target
                ? <a className="model-readme__link" href={target} target="_blank" rel="noreferrer" key={key}>{renderInline(linkText, base)}</a>
                : linkText);
        } else if (code) {
            nodes.push(<code className="model-readme__code-inline" key={key}>{code}</code>);
        } else if (bold || boldAlt) {
            nodes.push(<strong key={key}>{renderInline(bold ?? boldAlt, base)}</strong>);
        } else if (italic || italicAlt) {
            nodes.push(<em key={key}>{renderInline(italic ?? italicAlt, base)}</em>);
        } else if (autolink) {
            nodes.push(<a className="model-readme__link" href={autolink} target="_blank" rel="noreferrer" key={key}>{autolink}</a>);
        }

        lastIndex = pattern.lastIndex;
    }

    if (lastIndex < text.length) nodes.push(text.slice(lastIndex));

    return nodes;
}

/**
 * Vyhodí z textu HTML a rozdělí ho na bloky.
 * Blok končí prázdným řádkem nebo začátkem jiného bloku (nadpis, seznam, tabulka…).
 * Blok kódu zůstává celý, i když obsahuje prázdné řádky.
 */
function toBlocks(markdown: string): string[][] {
    const text = markdown
        .replace(/<!--[\s\S]*?-->/g, "")
        .replace(/<img\b[^>]*?src\s*=\s*["']([^"']+)["'][^>]*?>/gi, (_, src: string) => `![](${src})`)
        .replace(/<a\b[^>]*?href\s*=\s*["']([^"']+)["'][^>]*?>([\s\S]*?)<\/a>/gi, (_, href: string, label: string) => `[${label.trim()}](${href})`)
        .replace(/<br\s*\/?>/gi, "\n")
        .replace(/<\/?[a-z][^>]*>/gi, "")
        .replace(/&[a-z#\d]+;/gi, (entity) => ENTITIES[entity.toLowerCase()] ?? entity)
        .replace(/\r\n?/g, "\n");

    const blocks: string[][] = [];
    let block: string[] = [];
    let inCode = false;

    for (const line of text.split("\n")) {
        const fence = /^\s*(```|~~~)/.test(line);
        const pipe = line.trim().startsWith("|");
        const inTable = block.length > 0 && block[0].trim().startsWith("|");

        // Ohraničení kódu a řádky tabulky patří vždy do aktuálního bloku
        if (fence || inCode || (pipe && inTable)) {
            if (fence) inCode = !inCode;

            block.push(line);
            continue;
        }

        // Tabulku ukončí každý řádek, který do ní nepatří
        if (block.length > 0 && inTable) {
            blocks.push(block);
            block = [];
        }

        // Nadpis je vždy samostatný blok
        if (/^#{1,6}\s/.test(line)) {
            if (block.length > 0) blocks.push(block);

            blocks.push([line]);
            block = [];
            continue;
        }

        // Prázdný řádek nebo začátek jiného bloku ten aktuální ukončí
        if (!line.trim() || (block.length > 0 && BLOCK_START.test(line))) {
            if (block.length > 0) blocks.push(block);

            block = line.trim() ? [line] : [];
            continue;
        }

        block.push(line);
    }

    if (block.length > 0) blocks.push(block);

    return blocks;
}

/** Vykreslí jeden blok textu - podle prvního řádku pozná, o jaký blok jde. */
function renderBlock(lines: string[], key: number, base: string): ReactNode {
    const first = lines[0];

    // Blok kódu (ohraničení se vynechá)
    if (/^\s*(```|~~~)/.test(first)) {
        return <pre className="model-readme__code-block" key={key}><code>{lines.slice(1, -1).join("\n")}</code></pre>;
    }

    // Vodorovná čára
    if (/^\s*(?:[-*_]\s*){3,}$/.test(first)) return <hr className="model-readme__rule" key={key} />;

    // Nadpis
    const heading = first.match(/^(#+)\s+(.*?)\s*#*$/);

    if (heading) {
        const tag = `h${Math.min(heading[1].length + 3, 6)}` as "h4" | "h5" | "h6";

        return createElement(tag, { className: "model-readme__heading", key }, renderInline(heading[2], base));
    }

    // Tabulka (první řádek je hlavička, druhý oddělovač)
    if (first.trim().startsWith("|")) {
        const cells = (row: string) => row.trim().replace(/^\||\|$/g, "").split("|").map((cell) => cell.trim());
        const [header, , ...rows] = lines.map(cells);

        return (
            <div className="model-readme__table-wrapper" key={key}>
                <table className="model-readme__table">
                    <thead><tr>{header.map((cell, i) => <th key={i}>{renderInline(cell, base)}</th>)}</tr></thead>

                    <tbody>
                        {rows.map((row, i) => (
                            <tr key={i}>{row.map((cell, j) => <td key={j}>{renderInline(cell, base)}</td>)}</tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    }

    // Seznam
    if (LIST_ITEM.test(first)) {
        const items: { text: string; depth: number }[] = [];

        for (const line of lines) {
            const item = line.match(LIST_ITEM);

            // Řádek bez odrážky je pokračování předchozí položky
            if (item) items.push({ text: item[3], depth: item[1].length > 1 ? 1 : 0 });
            else if (items.length > 0) items[items.length - 1].text += ` ${line.trim()}`;
        }

        return createElement(
            /^\s*\d+[.)]\s/.test(first) ? "ol" : "ul",
            { className: "model-readme__list", key },
            items.map((item, index) => (
                <li className={item.depth ? "model-readme__item model-readme__item--nested" : "model-readme__item"} key={index}>
                    {renderInline(item.text.replace(/^\[x\]\s*/i, "☑ ").replace(/^\[\s*\]\s*/, "☐ "), base)}
                </li>
            ))
        );
    }

    // Citace
    if (/^\s*>/.test(first)) {
        const quoted = lines.map((line) => line.replace(/^\s*>\s?/, "")).join(" ");

        return <blockquote className="model-readme__quote" key={key}>{renderInline(quoted, base)}</blockquote>;
    }

    // Odstavec
    return <p className="model-readme__paragraph" key={key}>{renderInline(lines.join(" ").trim(), base)}</p>;
}

/** Převede text model card na React prvky. */
function renderMarkdown(markdown: string, base: string): ReactNode[] {
    return toBlocks(markdown).map((lines, index) => renderBlock(lines, index, base));
}

export default renderMarkdown;
