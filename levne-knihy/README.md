# AI Modely

Webová aplikace pro prohlížení AI modelů. Nepřihlášení návštěvníci mohou prohlížet modely, přihlášení uživatelé navíc spravovat svůj profil.

## Technologie

**Frontend** (`levne-knihy`): React 18, TypeScript, Vite, React Router v6, react-toastify

**Backend** (`levne-knihy-node`): Node.js, Express, MongoDB (Mongoose), JWT, bcryptjs

## Struktura frontendu

```
src/
├── api/              # společná utilita pro zpracování odpovědí API
├── config.ts         # adresa API podle prostředí
├── index.tsx         # vstupní bod (React root, BrowserRouter)
├── App.tsx           # rozložení stránky, autentizační provider, notifikace
├── routes/           # centrální routování aplikace
│   ├── paths.ts      #   vzory všech cest (jediný zdroj pravdy pro URL)
│   ├── guards.tsx    #   strážci přístupu (RequireAuth, RequireGuest)
│   └── AppRoutes.tsx #   routovací tabulka
├── features/         # funkční celky
│   ├── layout/       #   Header, Footer, Main, NotFound
│   ├── user/         #   autentizace a profil (api/, components/, context/, hooks/)
│   └── models/       #   modely AI (api/, components/, hooks/)
├── ui/               # sdílené prezentační komponenty
└── styles/           # globální styly
```

Každý funkční celek (`features/*`) má vlastní komponenty, hooky, API vrstvu a typy; mezi celky se importuje přes barrel (`@/features/user`).

## Routy aplikace

| Cesta | Stránka | Přístup |
| --- | --- | --- |
| `/` | Seznam všech modelů | veřejná |
| `/model/:modelId` | Detail modelu | veřejná |
| `/prihlasit-se` | Přihlášení | pouze nepřihlášení |
| `/registrovat-se` | Registrace | pouze nepřihlášení |
| `/uzivatel` | Profil uživatele | pouze přihlášení |

## Struktura backendu

```
levne-knihy-node/
├── config/env.js        # načtení a kontrola proměnných prostředí
├── controllers/         # logika endpointů (auth, user, model)
├── middleware/          # autentizace (JWT) a validace vstupů
├── models/              # Mongoose schémata
├── routes/              # definice endpointů
├── seed.js              # naplnění databáze testovacími daty
└── server.js            # spuštění serveru
```

## Spuštění

### Backend

```bash
cd levne-knihy-node
npm install
npm run dev        # vývoj (nodemon), nebo npm start
```

Backend očekává v `.env` proměnné `MONGO_URI` a `JWT_SECRET`, výchozí port je `5000`.

Testovací data lze do databáze naplnit příkazem `node seed.js` (testovací přihlášení: uživatel `petra`, heslo `test123`).

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
