import "./NotFound.css";

import { LinkButton, PageContainer, PageMessage, PageTitle } from "@/ui";
import { ROUTE_PATHS } from "@/routes";

/** Stránka pro neznámé adresy (404). */
function NotFound() {
    return (
        <PageContainer>
            <PageTitle centered>Stránka nebyla nalezena</PageTitle>

            <PageMessage>
                Tato adresa neexistuje nebo byla přesunuta.
            </PageMessage>

            <div className="not-found__actions">
                <LinkButton to={ROUTE_PATHS.home}>
                    Zpět na hlavní stránku
                </LinkButton>
            </div>
        </PageContainer>
    );
}

export default NotFound;
