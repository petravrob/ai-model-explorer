# Archiv: autentizace uživatele (frontend)

Přihlašování, registrace a profil uživatele byly vyřazené z běžící aplikace, ale kód záměrně zůstává v repozitáři, aby se dal později vrátit.

Složka `_archive/` leží mimo `src`, proto ji `tsconfig.json` (má `include: ["src"]`) ani build Vite nezahrnují. Kód se tedy nekontroluje TypeScriptem a nedostane se do produkčního bundlu.

## Co je v archivu

| Soubor ve archivu | Původní umístění |
| --- | --- |
| `features/user/**` | `src/features/user/**` (celá feature: api, components, context, hooks, types, index) |
| `routes/guards.tsx` | `src/routes/guards.tsx` (RequireAuth, RequireGuest) |

Poslední commit, ve kterém byla autentizace ještě plně zapojená, je `3935409` (větev `bugfix/034-obsolete-log-in-and-sign-up`). Odtud lze soubory kdykoli vyzvednout i přes git.

## Jak autentizaci obnovit

1. Přesuňte soubory zpět na původní místa uvedená v tabulce výše.
2. `src/App.tsx`: obalte `<AppLayout>` komponentou `AuthProvider` a doplňte import `import { AuthProvider } from "@/features/user";`.
3. `src/routes/paths.ts`: vraťte do `ROUTE_PATHS` položky `login: "/prihlasit-se"`, `signUp: "/registrovat-se"`, `user: "/uzivatel"` a rozhraní `AuthRedirectState` (stav předávaný při přesměrování na přihlášení).
4. `src/routes/index.ts`: doplňte `export type { AuthRedirectState } from "./paths";`.
5. `src/routes/AppRoutes.tsx`: vraťte importy `LogIn`, `SignUp`, `User`, `RequireAuth`, `RequireGuest` a obě skupiny rout (pro nepřihlášené přihlášení a registrace, pro přihlášené profil).
6. `src/features/layout/components/Header/Header.tsx`: vraťte import `UserDropdown, useCurrentUser, useLogout` z `@/features/user`, tlačítka „Přihlásit se“ a „Registrovat se“ a větev s `UserDropdown`.
7. `src/features/layout/components/Header/Header.css`: vraťte odstraněné styly (`.header__auth` včetně varianty `.btn`, `.header__login` a `.header__login-icon`, přepisy avataru v `.user-dropdown__trigger` a `.header__auth` v media query pro šířku 820 px).
8. Backend: viz `ai-modely-node/_archive/ARCHIVE.md` (napojení rout v `app.js`).

## Co zůstalo nedotčené

- Sdílené komponenty `Avatar`, `Form`, `FormField` a `FormActions` a ikona `USER_ICON` (`src/ui`) zůstaly na místě, i když je teď aplikace nepoužívá. Jsou to obecné prezentační prvky, které se při obnovení autentizace použijí beze změny.
- `src/api/apiUtils.ts` je společná utilita pro zpracování odpovědí API, proto se nemění.


