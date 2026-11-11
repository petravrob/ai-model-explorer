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

Modely se do databáze plní příkazem `npm run import:models`. Výpis se skládá především z ní – uložené modely mají hotové popisky i avatary, takže se pro ně nic dalšího negeneruje a nečeká se na Hugging Face. Pokud model není uložen, data je potřeba načíst živě přímo z Hugging Face.

### Nová databáze

Databáze má jedinou kolekci `models`, ve které je uložený model včetně vygenerovaného českého i anglického popisu a přehledů. Připojovací řetězec v `.env` musí obsahovat název databáze (`...mongodb.net/ai-model-explorer?appName=ai-model-explorer`), jinak by se data uložila do výchozí databáze `test`. Postup:

```bash
npm run create:indexes                    # založí kolekce a indexy pro řazení a filtrování
npm run import:models                     # naplní katalog modely z Hugging Face
npm run import:models -- --per-task=100   # volitelně větší počet modelů na jednu úlohu
```

Indexy se záměrně nevytvářejí při startu serveru (`autoIndex: false`), aby se nestavěly při každém spuštění. Vygenerované texty (české i anglické) zůstávají při dalším importu zachované, protože import zapisuje data modelu.

### Předgenerování popisků (rychlé první načtení)

Popisky se generují na pozadí (česky i anglicky) a ukládají do databáze. Aby aplikace při otevření nic negenerovala, lze je připravit předem:

```bash
npm run prewarm:descriptions -- --limit=100
npm run prewarm:descriptions -- --from-api=https://ai-modely-api.onrender.com --limit=100
npm run prewarm:descriptions -- --sort=created --limit=100
npm run prewarm:descriptions -- --all
```

Skript vybírá modely bez aktuálního popisku v obou jazycích, přednostně ty nejsledovanější. `--from-api` omezí výběr na modely, které právě vrací běžící aplikace, `--sort` určí pořadí výběru (`downloads`, `likes`, `created`, `trending`), `--dry-run` jen vypíše, co by se generovalo, a `--timeout=20` nastaví limit čekání v minutách. Zapisuje do databáze uvedené v `MONGO_URI`, proto před spuštěním proti produkci zkontrolujte, že `.env` míří na správnou databázi.

### Dvojjazyčný obsah a API


```bash
GET  /api/models?lang=en
GET  /api/models/:modelId?lang=en
POST /api/models/:modelId/insights?lang=en
POST /api/models/descriptions?lang=en
```

Bez parametru (nebo s `lang=cs`) se vrací čeština. Chybí-li anglická verze, vrátí se `null` a server si text zařadí do fronty na pozadí – klient ho uvidí při dalším načtení. Chybové odpovědi API se řídí stejným parametrem. Hromadně lze obě verze doplnit přes `npm run generate:content`, případně jen chybějící jazyk:

```bash
npm run generate:content -- --lang=en   # doplní jen chybějící anglické texty
npm run generate:content -- --lang=cs   # doplní jen chybějící české texty
```


### Probuzení hostingu

Backend na Renderu v tarifu zdarma se po neaktivnosti uspí a první požadavek pak může trvat desítky sekund. Endpoint `GET /health` odpovídá okamžitě a nedělá přitom dotaz do databáze ani na Hugging Face. Probuzení zrealizováno přes cron-job.org s intervalem 10 minut.

Význam polí kolekce `models`:

| Pole | Význam |
| --- | --- |
| `modelId` | identifikátor modelu na Hugging Face, podle něj se model dohledává a aktualizuje |
| `publishedAt` | kdy model vznikl na Hugging Face (odlišné od `createdAt`, což je čas uložení v této aplikaci) |
| `lastModified`, `statsUpdatedAt` | kdy se naposledy změnil model a kdy se obnovily statistiky |
| `description` | vygenerovaný popisek (`text` česky, `textEn` anglicky, `version`, `status`, `generatedAt`) |
| `insights` | vygenerované přehledy z dokumentace v češtině (`sourceFingerprint`, `promptVersion`, `status`, `generatedAt` a další pole) |
| `insightsEn` | anglický překlad přehledů (stejná struktura jako `insights`, obrázky a videa zůstávají společné) |
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
