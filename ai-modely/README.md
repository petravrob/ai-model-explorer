# AI model explorer

Webová aplikace pro prohlížení AI modelů z Hugging Face.

## Technologie

**Frontend** (`ai-modely`): React 18, TypeScript, Vite, React Router v6, react-toastify, Fuse.js

**Backend** (`ai-modely-node`): Node.js, Express, MongoDB (Mongoose)

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

- `ai-modely/_archive/` - frontendová část (feature `user` a strážci přístupu)
- `ai-modely-node/_archive/` - backendová část (auth a user endpointy, middleware, model User, seed)

Proměnná `JWT_SECRET` v `.env` a závislosti `jsonwebtoken` a `bcryptjs` v backendu zůstávají, protože je používá právě vyřazená autentizace.

Postup obnovení je popsaný v `ai-modely/_archive/ARCHIVE.md` a v `ai-modely-node/_archive/ARCHIVE.md`.

## Struktura backendu

```
ai-modely-node/
├── _archive/            # vyřazená autentizace (mimo běžící aplikaci)
├── config/              # připojení k databázi a proměnné prostředí
├── controllers/         # logika endpointů (model)
├── middleware/          # zpracování chyb
├── models/              # Mongoose schéma modelu
├── routes/              # definice endpointů
├── scripts/             # import modelů a vytvoření indexů
├── services/            # práce s Hugging Face, ukládání modelů a generování textů
└── server.js            # spuštění serveru
```

## Spuštění

### Backend

```bash
cd ai-modely-node
npm install
npm run dev        # vývoj (nodemon), nebo npm start
```

Backend očekává v `.env` proměnné `MONGO_URI` a `JWT_SECRET` (druhou z nich používá jen vyřazená autentizace, ale `config/env.js` ji stále vyžaduje), výchozí port je `5000`.

Modely se do databáze plní příkazem `npm run import:models`.

### Nová databáze

Databáze má jedinou kolekci `models`, ve které je uložený model včetně vygenerovaného českého popisu a přehledů. Připojovací řetězec v `.env` musí obsahovat název databáze (`...mongodb.net/ai-model-explorer?appName=ai-model-explorer`), jinak by se data uložila do výchozí databáze `test`. Postup:

```bash
npm run create:indexes                    # založí kolekce a indexy pro řazení a filtrování
npm run import:models                     # naplní katalog modely z Hugging Face
npm run import:models -- --per-task=100   # volitelně větší počet modelů na jednu úlohu
```

Indexy se záměrně nevytvářejí při startu serveru (`autoIndex: false`), aby se nestavěly při každém spuštění. Vygenerované české texty zůstávají při dalším importu zachované, protože import zapisuje data modelu.

### Předgenerování popisků (rychlé první načtení)

Popisky se generují na pozadí a ukládají do databáze. Aby aplikace při otevření nic negenerovala, lze je připravit předem:

```bash
npm run prewarm:descriptions -- --limit=100
npm run prewarm:descriptions -- --from-api=https://ai-modely-api.onrender.com --limit=100
npm run prewarm:descriptions -- --sort=created --limit=100
npm run prewarm:descriptions -- --all
```

Skript vybírá modely bez aktuálního popisku, přednostně ty nejsledovanější. `--from-api` omezí výběr na modely, které právě vrací běžící aplikace, `--sort` určí pořadí výběru (`downloads`, `likes`, `created`, `trending`), `--dry-run` jen vypíše, co by se generovalo, a `--timeout=20` nastaví limit čekání v minutách. Zapisuje do databáze uvedené v `MONGO_URI`, proto před spuštěním proti produkci zkontrolujte, že `.env` míří na správnou databázi.


### Probuzení hostingu

Backend na Renderu v tarifu zdarma se po neaktivnosti uspí a první požadavek pak může trvat desítky sekund. Endpoint `GET /health` odpovídá okamžitě a nedělá přitom dotaz do databáze ani na Hugging Face. Probuzení zrealizováno přes cron-job.org s intervalem 10 minut.

Význam polí kolekce `models`:

| Pole | Význam |
| --- | --- |
| `modelId` | identifikátor modelu na Hugging Face, podle něj se model dohledává a aktualizuje |
| `publishedAt` | kdy model vznikl na Hugging Face (odlišné od `createdAt`, což je čas uložení v této aplikaci) |
| `lastModified`, `statsUpdatedAt` | kdy se naposledy změnil model a kdy se obnovily statistiky |
| `description` | vygenerovaný český popisek (`text`, `version`, `status`, `generatedAt`) |
| `insights` | vygenerované české přehledy z dokumentace (`sourceFingerprint`, `status`, `generatedAt` a další pole) |
| `avatarUrl` | adresa avataru autora, aby se nemusela dotahovat při zobrazení výpisu |

### Frontend

```bash
cd ai-modely
npm install
npm run dev        # vývojový server (Vite)
```

Přes `.env` lze nastavit `VITE_API_URL=development` pro komunikaci s lokálním backendem (jinak se používá produkční adresa).

### Produkční build

```bash
cd ai-modely
npm run build      # výstup do složky dist/
npm run preview    # lokální náhled produkčního buildu
```
