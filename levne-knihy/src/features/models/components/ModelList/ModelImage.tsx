import { useEffect, useState } from "react";

import { getAuthorAvatar } from "../../api/modelsApi";

interface ModelImageProps {
    name: string;
    task: string;
    author: string;
}

/** Vytvoří jednoduchý placeholder obrázek modelu – barevný blok s počátečním písmenem. */
function createModelImage(name: string, task: string): string {

    // Odstín se odvodí z názvu a úlohy, aby měl každý model svou stabilní barvu
    const hash = [...(name + task)].reduce(
        (sum, character) => sum + character.charCodeAt(0),
        0
    );

    const hue = hash % 360;
    const letter = (name[0] ?? "?").toUpperCase();

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400">
        <rect width="400" height="400" fill="hsl(${hue}, 32%, 40%)"/>
        <text x="200" y="266" text-anchor="middle" font-family="Arial, sans-serif" font-size="150" font-weight="700" fill="rgba(255, 255, 255, 0.85)">${letter}</text>
    </svg>`;

    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

/**
 * Obrázek modelu – ihned ukáže zástupný obrázek a adresu avataru autora
 * si dotáhne na pozadí, takže načtení seznamu modelů nikdy neblokuje.
 */
function ModelImage({ name, task, author }: ModelImageProps) {

    // Adresa avataru, nebo null = zástupný obrázek (dokud se avatar nenačte)
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

    useEffect(() => {
        void getAuthorAvatar(author).then(setAvatarUrl);
    }, [author]);

    return (
        <img
            className="model-list__image"
            src={avatarUrl ?? createModelImage(name, task)}
            alt={name}
            loading="lazy"
            onError={() => setAvatarUrl(null)}
        />
    );
}

export default ModelImage;
