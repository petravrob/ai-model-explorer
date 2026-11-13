
import "./DevInfoDialog.css";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";

import { getCurrentLanguage } from "@/i18n";
import { Button } from "@/ui";

import { DEV_INFO_CONTENT } from "../../devInfoContent";

interface DevInfoDialogProps {
    onClose: () => void;
}

/** Okno s aktuálními informacemi o vývoji aplikace. */
function DevInfoDialog({ onClose }: DevInfoDialogProps) {
    const { t } = useTranslation("layout");
    const content = DEV_INFO_CONTENT[getCurrentLanguage()];

    const sections = [
        {
            id: "status",
            title: t("devInfo.statusTitle"),
            items: content.status,
        },
        {
            id: "issues",
            title: t("devInfo.issuesTitle"),
            items: content.knownIssues,
        },
        {
            id: "planned",
            title: t("devInfo.plannedTitle"),
            items: content.plannedFeatures,
        },
    ];

    // Zavření klávesou Escape a zablokování posouvání stránky pod oknem
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent): void => {
            if (event.key === "Escape") {
                onClose();
            }
        };

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        document.addEventListener("keydown", handleKeyDown);

        return () => {
            document.body.style.overflow = previousOverflow;
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [onClose]);

    return createPortal(
        <div className="dev-info-dialog__backdrop" onClick={onClose}>
            <div
                className="dev-info-dialog"
                role="dialog"
                aria-modal="true"
                aria-labelledby="dev-info-dialog-title"
                onClick={(event) => event.stopPropagation()}
            >
                <header className="dev-info-dialog__header">
                    <h2
                        className="dev-info-dialog__title"
                        id="dev-info-dialog-title"
                    >
                        {t("devInfo.title")}
                    </h2>
                </header>

                <p className="dev-info-dialog__updated">
                    {t("devInfo.updated", { date: content.updatedAt })}
                </p>

                {sections.map((section) => (
                    <section
                        key={section.id}
                        className="dev-info-dialog__section"
                    >
                        <h3 className="dev-info-dialog__section-title">
                            {section.title}
                        </h3>

                        <ul className="dev-info-dialog__list">
                            {section.items.map((item, index) => (
                                <li key={index}>{item}</li>
                            ))}
                        </ul>
                    </section>
                ))}

                <footer className="dev-info-dialog__footer">
                    <p className="dev-info-dialog__github-note">
                        {t("devInfo.githubNoteBefore")}{" "}
                        <a
                            className="dev-info-dialog__github-link"
                            href="https://github.com/petravrob/ai-model-explorer"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            {t("devInfo.githubNoteLink")}
                        </a>
                        .
                    </p>

                    <Button className="dev-info-dialog__close-button" onClick={onClose}>{t("devInfo.closeButton")}</Button>
                </footer>
            </div>
        </div>,
        document.body
    );
}

export default DevInfoDialog;
