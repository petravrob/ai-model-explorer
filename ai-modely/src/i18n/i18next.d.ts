import "i18next";

import type { DEFAULT_NAMESPACE, resources } from "./resources";

/** Typy překladů: neexistující klíč je chyba při kompilaci a editor klíče napovídá. */
declare module "i18next" {
    interface CustomTypeOptions {
        defaultNS: typeof DEFAULT_NAMESPACE;
        resources: (typeof resources)["cs"];
    }
}
