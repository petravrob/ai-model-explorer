import { useEffect, useState } from "react";

import { getAuthorAvatar } from "../../api/modelsApi";

interface ModelImageProps {
    name: string;
    author: string;
    avatarUrl?: string | null;
    className?: string;
}

/**
 * Vytvoří zástupný obrázek modelu (když se nenačte avatar) - počáteční písmeno s podbarvením
 */
function createModelImage(name: string): string {
    const letter = (name[0] ?? "?").toUpperCase();

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400">
        <rect width="400" height="400" fill="#eef2ff"/>
        <text x="200" y="266" text-anchor="middle" font-family="Arial, sans-serif" font-size="150" font-weight="700" fill="#4f46e5">${letter}</text>
    </svg>`;

    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

/**
 * Obrázek modelu. Použije avatar, který už máme v datech modelu, chybějící adresu
 * si dotáhne na pozadí, takže načtení seznamu modelů nikdy neblokuje.
 */
function ModelImage({ name, author, avatarUrl = null, className = "model-list__image" }: ModelImageProps) {

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
            src={loadedAvatarUrl ?? createModelImage(name)}
            alt={name}
            loading="lazy"
            onError={() => setLoadedAvatarUrl(null)}
        />
    );
}

export default ModelImage;
