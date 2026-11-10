import "./LanguageSwitcher.css";

import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import type { AppLanguage } from "@/i18n";

import { CzechFlag, EnglishFlag } from "./flags";

/** Jazyky nabízené v přepínači (názvy jsou záměrně vždy v daném jazyce). */
const LANGUAGE_OPTIONS = [
    { code: "cs", label: "Čeština", Flag: CzechFlag },
    { code: "en", label: "English", Flag: EnglishFlag },
] as const;

/**
 * Přepínač jazyka rozhraní v pravém horním rohu lišty.
 * Tlačítko ukazuje vlajku aktuálního jazyka, po kliknutí nabídne výběr.
 * Volba se uloží do localStorage (řeší i18next detektor), takže přežije návštěvy.
 */
function LanguageSwitcher() {
    const { t, i18n } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const rootRef = useRef<HTMLDivElement>(null);

    const currentLanguage = (i18n.resolvedLanguage ?? "en") as AppLanguage;
    const currentOption =
        LANGUAGE_OPTIONS.find((option) => option.code === currentLanguage) ??
        LANGUAGE_OPTIONS[1];

    // Kliknutí mimo nabídku nebo klávesa Escape ji zavře
    useEffect(() => {
        if (!isOpen) {
            return;
        }

        const handlePointerDown = (event: PointerEvent): void => {
            if (!rootRef.current?.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        const handleKeyDown = (event: KeyboardEvent): void => {
            if (event.key === "Escape") {
                setIsOpen(false);
            }
        };

        document.addEventListener("pointerdown", handlePointerDown);
        document.addEventListener("keydown", handleKeyDown);

        return () => {
            document.removeEventListener("pointerdown", handlePointerDown);
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [isOpen]);

    /** Přepne jazyk celé aplikace a nabídku zavře. */
    const selectLanguage = (code: AppLanguage): void => {
        void i18n.changeLanguage(code);
        setIsOpen(false);
    };

    return (
        <div className="language-switcher" ref={rootRef}>
            <button
                type="button"
                className="language-switcher__toggle"
                aria-label={t("header.languageSwitcher")}
                aria-haspopup="listbox"
                aria-expanded={isOpen}
                title={t("header.languageSwitcher")}
                onClick={() => setIsOpen((open) => !open)}
            >
                <currentOption.Flag className="language-switcher__flag" />
            </button>

            {isOpen && (
                <div
                    className="language-switcher__menu"
                    role="listbox"
                    aria-label={t("header.languageSwitcher")}
                >
                    {LANGUAGE_OPTIONS.map(({ code, label, Flag }) => (
                        <button
                            key={code}
                            type="button"
                            role="option"
                            aria-selected={code === currentLanguage}
                            className={`language-switcher__option${
                                code === currentLanguage
                                    ? " language-switcher__option--active"
                                    : ""
                            }`}
                            onClick={() => selectLanguage(code)}
                        >
                            <Flag className="language-switcher__flag" />
                            <span>{label}</span>
                            {code === currentLanguage && (
                                <span className="language-switcher__check" aria-hidden="true">
                                    ✓
                                </span>
                            )}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

export default LanguageSwitcher;
