# AI Modely

Webová aplikace pro prohlížení AI modelů z Hugging Face.

## Technologie

**Frontend** (`levne-knihy`): React 18, TypeScript, Vite, React Router v6, react-toastify, Fuse.js

**Backend** (`levne-knihy-node`): Node.js, Express, MongoDB (Mongoose)

## Struktura frontendu

```
src/
├── api/              # společná utilita pro zpracování odpovědí API
├── config.ts         # adresa API podle prostředí
├── index.tsx         # vstupní bod (React root, BrowserRouter)
├── App.tsx           # rozložení stránky, notifikace
├── routes/           # centrální routování aplikace
│   ├── paths.ts      #   vzory všech cest (jediný zdroj pravdy pro URL)
│   └── AppRoutes.tsx #   routovací tabulka
├── features/         # funkční celky
│   ├── layout/       #   Header, Footer, Main, NotFound
│   └── models/       #   modely AI (api/, components/, hooks/)
├── ui/               # sdílené prezentační komponenty
└── styles/           # globální styly
```

Každý funkční celek (`features/*`) má vlastní komponenty, hooky, API vrstvu a typy; mezi celky se importuje přes barrel (`@/features/models`).

## Routy aplikace

| Cesta | Stránka | Přístup |
| --- | --- | --- |
| `/` | Seznam všech modelů | veřejná |
| `/model/:modelId` | Detail modelu | veřejná |

Ostatní adresy zobrazí stránku „Stránka nebyla nalezena“.

## Vyřazená autentizace (archiv)

Přihlašování, registrace a profil uživatele jsou z aplikace dočasně vyřazené, ale kód zůstává v repozitáři ve složkách `_archive/`. Ty leží mimo `src`, a proto se nebuildí a nekontrolují TypeScriptem.

- `levne-knihy/_archive/` - frontendová část (feature `user` a strážci přístupu)
- `levne-knihy-node/_archive/` - backendová část (auth a user endpointy, middleware, model User, seed)

Proměnná `JWT_SECRET` v `.env` a závislosti `jsonwebtoken` a `bcryptjs` v backendu zůstávají, protože je používá právě vyřazená autentizace.

Postup obnovení je popsaný v `levne-knihy/_archive/ARCHIVE.md` a v `levne-knihy-node/_archive/ARCHIVE.md`.

## Struktura backendu

```
levne-knihy-node/
├── _archive/            # vyřazená autentizace (mimo běžící aplikaci)
├── config/env.js        # načtení a kontrola proměnných prostředí
├── controllers/         # logika endpointů (model)
├── middleware/          # zpracování chyb
├── models/              # Mongoose schémata modelů
├── routes/              # definice endpointů
└── server.js            # spuštění serveru
```

## Spuštění

### Backend

```bash
cd levne-knihy-node
npm install
npm run dev        # vývoj (nodemon), nebo npm start
```

Backend očekává v `.env` proměnné `MONGO_URI` a `JWT_SECRET` (druhou z nich používá jen vyřazená autentizace, ale `config/env.js` ji stále vyžaduje), výchozí port je `5000`.

Modely se do databáze plní příkazem `npm run import:models`.

### Frontend

```bash
cd levne-knihy
npm install
npm run dev        # vývojový server (Vite)
```

Přes `.env` lze nastavit `VITE_API_URL=development` pro komunikaci s lokálním backendem (jinak se používá produkční adresa).

### Produkční build

```bash
cd levne-knihy
npm run build      # výstup do složky dist/
npm run preview    # lokální náhled produkčního buildu
```
