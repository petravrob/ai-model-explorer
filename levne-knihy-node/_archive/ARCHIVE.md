# Archiv: autentizace uživatele (backend)

Endpointy pro přihlášení, registraci a profil uživatele byly vyřazené z běžícího serveru, ale kód záměrně zůstává v repozitáři. Složka `_archive/` není z aplikace odkazovaná, takže se nenačítá.

## Co je v archivu

| Soubor ve archivu | Původní umístění |
| --- | --- |
| `controllers/authController.js` | `controllers/authController.js` |
| `controllers/userController.js` | `controllers/userController.js` |
| `middleware/authMiddleware.js` | `middleware/authMiddleware.js` |
| `middleware/validationMiddleware.js` | `middleware/validationMiddleware.js` |
| `models/User.js` | `models/User.js` |
| `routes/authRoutes.js` | `routes/authRoutes.js` |
| `routes/userRoutes.js` | `routes/userRoutes.js` |
| `seed.js` | `seed.js` |

Vyřazené endpointy:

- `POST /registrovat-se` - registrace, vrací token
- `POST /prihlasit-se` - přihlášení, vrací token
- `POST /uzivatel` - úprava údajů, vyžaduje token
- `POST /` - načtení přihlášeného uživatele, vyžaduje token

Poslední commit, ve kterém byla autentizace ještě plně zapojená, je `3935409` (větev `bugfix/034-obsolete-log-in-and-sign-up`).

## Jak autentizaci obnovit

1. Přesuňte soubory zpět na původní místa uvedená v tabulce výše.
2. `app.js`: vraťte `const authRoutes = require("./routes/authRoutes");`, `const userRoutes = require("./routes/userRoutes");` a napojení `app.use("/", authRoutes);` a `app.use("/", userRoutes);`.
3. Ověřte, že `.env` obsahuje `JWT_SECRET`, který vyžaduje `config/env.js`.
4. Testovací uživatele vytvoří `node seed.js` (přihlášení: uživatel `petra`, heslo `test123`).
5. Frontend: viz `levne-knihy/_archive/ARCHIVE.md`.

## Co zůstalo nedotčené

- `config/env.js` stále načítá a kontroluje `JWT_SECRET`, i když ho teď používá jen vyřazená autentizace. Nechal jsem to beze změny kvůli snadnému obnovení.
- V `package.json` zůstávají závislosti `bcryptjs` a `jsonwebtoken`, které používá jen vyřazená autentizace, aby po obnovení nebylo potřeba nic doinstalovávat.
- Endpointy modelů (`routes/modelRoutes.js`) jsou veřejné a na autentizaci nezávisí, proto se jich změna netýká.


