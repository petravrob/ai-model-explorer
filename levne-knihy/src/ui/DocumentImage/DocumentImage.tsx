import "./DocumentImage.css";

import { useState } from "react";

interface DocumentImageProps {
    src: string;
    alt: string;
}

/** Obrázek převzatý z dokumentace modelu; když se nenačte, schová se. */
function DocumentImage({ src, alt }: DocumentImageProps) {
    const [failed, setFailed] = useState(false);

    if (failed) {
        return null;
    }

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

            {alt && <figcaption className="document-image__caption">{alt}</figcaption>}
        </figure>
    );
}

export default DocumentImage;
