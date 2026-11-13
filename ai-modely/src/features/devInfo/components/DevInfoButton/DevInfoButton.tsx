import "./DevInfoButton.css";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";

import { isModelDetailPath } from "@/routes/paths";
import { Icon, INFO_ICON } from "@/ui";

import DevInfoDialog from "../DevInfoDialog/DevInfoDialog";

/** Plovoucí tlačítko v pravém dolním rohu, které otevře okno s informacemi o vývoji. */
function DevInfoButton() {
    const { t } = useTranslation("layout");
    const location = useLocation();
    const [isOpen, setIsOpen] = useState(false);

    // Na detailu modelu dole sedí lišta s tlačítkem Zpět, plovoucí tlačítko by ji překrývalo
    if (isModelDetailPath(location.pathname)) {
        return null;
    }

    return (
        <>
            <button
                type="button"
                className="dev-info-button"
                onClick={() => setIsOpen(true)}
                aria-haspopup="dialog"
                aria-expanded={isOpen}
                aria-label={t("devInfo.buttonAria")}
                title={t("devInfo.buttonAria")}
            >
                <Icon path={INFO_ICON} className="dev-info-button__icon" />
                <span className="dev-info-button__label">{t("devInfo.button")}</span>
            </button>

            {isOpen && <DevInfoDialog onClose={() => setIsOpen(false)} />}
        </>
    );
}

export default DevInfoButton;
