import "./DocumentVideo.css";

import { useState } from "react";

interface DocumentVideoProps {
    url: string;
    title: string;
    thumbnail: string;
}

/**
 * Video z dokumentace modelu – náhledový obrázek s odkazem na videoportál,
 * nebo přehrávač u videa, které jde přehrát přímo. Co se nenačte, se schová.
 */
function DocumentVideo({ url, title, thumbnail }: DocumentVideoProps) {
    const [failed, setFailed] = useState(false);

    if (failed) {
        return null;
    }

    const label = title.trim();

    return (
        <figure className="document-video">
            {thumbnail
                ? (
                    <a className="document-video__link" href={url} target="_blank" rel="noreferrer">
                        <img
                            className="document-video__media"
                            src={thumbnail}
                            alt={label}
                            loading="lazy"
                            referrerPolicy="no-referrer"
                            onError={() => setFailed(true)}
                        />
                    </a>
                )
                : (
                    <video
                        className="document-video__media"
                        src={url}
                        controls
                        preload="metadata"
                        onError={() => setFailed(true)}
                    />
                )}

            {label && <figcaption className="document-video__caption">{label}</figcaption>}
        </figure>
    );
}

export default DocumentVideo;
