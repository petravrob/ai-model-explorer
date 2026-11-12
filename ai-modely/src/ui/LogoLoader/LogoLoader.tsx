import { useTranslation } from "react-i18next";

import LogoBadge from "../LogoBadge/LogoBadge";

interface LogoLoaderProps {
    // Text, který se ohlásí čtečkám obrazovky (na stránce se nezobrazuje)
    label?: string;
}

/** Načítací animace s logem aplikace - značka se hýbe pořád (viz LogoBadge). */
function LogoLoader({ label }: LogoLoaderProps) {
    const { t } = useTranslation();

    return <LogoBadge className="logo-loader" playing label={label ?? t("updatingModels")} />;
}

export default LogoLoader;