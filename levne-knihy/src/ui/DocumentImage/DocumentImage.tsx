import "./DocumentImage.css";

import { useState } from "react";

interface DocumentImageProps {
    src: string;
    alt: string;
    // Nadpis z dokumentace, pod kterým obrázek stojí
    caption?: string;
}

/** Obrázek převzatý z dokumentace modelu; když se nenačte, schová se. */
function DocumentImage({ src, alt, caption }: DocumentImageProps) {
    const [failed, setFailed] = useState(false);

    if (failed) {
        return null;
    }

    const label = caption?.trim() || alt.trim();

    return (
        <figure className="document-image">
            <img
                className="document-image__img"
                src={src}
                alt={alt}
                loading="lazy"
                referrerPolicy="no-referrer"
                onError={() => setFailed(true)}
            />

            {label && <figcaption className="document-image__caption">{label}</figcaption>}
        </figure>
    );
}

export default DocumentImage;
