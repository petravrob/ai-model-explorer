import "./DocumentImage.css";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

interface DocumentImageProps {
    src: string;
    alt: string;
    // Nadpis z dokumentace, pod kterým obrázek stojí
    caption?: string;
}

/**
 * Obrázek převzatý z dokumentace modelu
 * Kliknutím se obrázek zvětší přes celou.
 */
function DocumentImage({ src, alt, caption }: DocumentImageProps) {
    const [failed, setFailed] = useState(false);
    const [isZoomed, setIsZoomed] = useState(false);

    useEffect(() => {
        if (!isZoomed) {
            return;
        }

        const handleKeyDown = (event: KeyboardEvent): void => {
            if (event.key === "Escape") {
                setIsZoomed(false);
            }
        };

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        document.addEventListener("keydown", handleKeyDown);

        return () => {
            document.body.style.overflow = previousOverflow;
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [isZoomed]);

    if (failed) {
        return null;
    }

    const label = caption?.trim() || alt.trim();

    return (
        <figure className="document-image">
            <button
                type="button"
                className="document-image__trigger"
                onClick={() => setIsZoomed(true)}
                aria-label={label ? `Zvětšit obrázek: ${label}` : "Zvětšit obrázek"}
            >
                <img
                    className="document-image__img"
                    src={src}
                    alt={alt}
                    loading="lazy"
                    referrerPolicy="no-referrer"
                    onError={() => setFailed(true)}
                />
            </button>

            {label && <figcaption className="document-image__caption">{label}</figcaption>}

            {isZoomed && createPortal(
                <div
                    className="document-image__lightbox"
                    role="dialog"
                    aria-modal="true"
                    aria-label={label || "Zvětšený obrázek"}
                    onClick={() => setIsZoomed(false)}
                >
                    <img className="document-image__lightbox-img" src={src} alt={alt} />

                    <button
                        type="button"
                        className="document-image__lightbox-close"
                        onClick={() => setIsZoomed(false)}
                        aria-label="Zavřít zvětšený obrázek"
                        autoFocus
                    >
                        ×
                    </button>
                </div>,
                document.body
            )}
        </figure>
    );
}

export default DocumentImage;
