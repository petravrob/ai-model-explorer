import { useEffect, useState } from "react";

import { getAuthorAvatar } from "../../api/modelsApi";

interface ModelImageProps {
    name: string;
    task: string;
    author: string;
    avatarUrl?: string | null;
    className?: string;
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
        <rect width="400" height="400" fill="hsl(${hue}, 58%, 91%)"/>
        <text x="200" y="266" text-anchor="middle" font-family="Arial, sans-serif" font-size="150" font-weight="700" fill="hsl(${hue}, 48%, 38%)">${letter}</text>
    </svg>`;

    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

/**
 * Obrázek modelu. Použije avatar, který už máme v datech modelu, chybějící adresu
 * si dotáhne na pozadí, takže načtení seznamu modelů nikdy neblokuje.
 */
function ModelImage({ name, task, author, avatarUrl = null, className = "model-list__image" }: ModelImageProps) {

    // Adresa avataru, nebo null = zástupný obrázek (dokud se avatar nenačte)
    const [loadedAvatarUrl, setLoadedAvatarUrl] = useState<string | null>(avatarUrl);

    useEffect(() => {

        // Pokud avatar existuje, tak je použitý
        if (avatarUrl) {
            setLoadedAvatarUrl(avatarUrl);
            return;
        }

        void getAuthorAvatar(author).then(setLoadedAvatarUrl);

    }, [author, avatarUrl]);

    return (
        <img
            className={className}
            src={loadedAvatarUrl ?? createModelImage(name, task)}
            alt={name}
            loading="lazy"
            onError={() => setLoadedAvatarUrl(null)}
        />
    );
}

export default ModelImage;
