import type { TOptions } from "i18next";

import i18n from "./index";

/**
 * Překlad klíče, který se skládá až za běhu (štítky z dat, položky konfigurace).
 *
 * Statické klíče v komponentách používají t() z useTranslation, které hlídá typy.
 * Tady se typová kontrola vynechává, protože klíč vzniká z hodnot modelů.
 */
export const translate = (key: string, options?: TOptions): string =>
    (i18n.t as unknown as (translationKey: string, translationOptions?: TOptions) => string)(
        key,
        options
    );
