import "./NotFound.css";

import { useTranslation } from "react-i18next";

import { LinkButton, PageContainer, PageMessage, PageTitle } from "@/ui";
import { ROUTE_PATHS } from "@/routes";

/** Stránka pro neznámé adresy (404). */
function NotFound() {
    const { t } = useTranslation("layout");

    return (
        <PageContainer>
            <PageTitle centered>{t("notFound.title")}</PageTitle>

            <PageMessage>
                {t("notFound.message")}
            </PageMessage>

            <div className="not-found__actions">
                <LinkButton to={ROUTE_PATHS.home}>
                    {t("notFound.backHome")}
                </LinkButton>
            </div>
        </PageContainer>
    );
}

export default NotFound;
