const { body, validationResult } = require("express-validator");

const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({
            status: "error",
            errors: errors.array(),
        });
    }

    next();
};


// Uživatelské údaje
const validateUser = [
    body("uname")
        .trim()
        .notEmpty()
        .withMessage("Uživatelské jméno je povinné.")
        .isLength({ min: 3, max: 30 })
        .withMessage("Uživatelské jméno musí obsahovat 3 až 30 znaků."),

    body("fname")
        .trim()
        .notEmpty()
        .withMessage("Jméno je povinné.")
        .isLength({ max: 50 })
        .withMessage("Jméno nesmí obsahovat více než 50 znaků."),

    body("lname")
        .trim()
        .notEmpty()
        .withMessage("Příjmení je povinné.")
        .isLength({ max: 50 })
        .withMessage("Příjmení nesmí obsahovat více než 50 znaků."),

    body("email")
        .trim()
        .notEmpty()
        .withMessage("E-mail je povinný.")
        .isEmail()
        .withMessage("Zadejte platnou e-mailovou adresu.")
        .normalizeEmail(),

    body("phone")
        .optional({ values: "falsy" })
        .trim()
        .isMobilePhone("any")
        .withMessage("Zadejte platné telefonní číslo."),

    body("password")
        .notEmpty()
        .withMessage("Heslo je povinné.")
        .isLength({ min: 8 })
        .withMessage("Heslo musí obsahovat alespoň 8 znaků."),

    handleValidationErrors,
];


// Přihlášení
const validateLogin = [
    body("uname")
        .trim()
        .notEmpty()
        .withMessage("Uživatelské jméno je povinné."),

    body("password")
        .notEmpty()
        .withMessage("Heslo je povinné."),

    handleValidationErrors,
];


// Vytvoření/úprava knihy
const validateBook = [
    body("name")
        .trim()
        .notEmpty()
        .withMessage("Název knihy je povinný.")
        .isLength({ max: 200 })
        .withMessage("Název knihy nesmí obsahovat více než 200 znaků."),

    body("author")
        .trim()
        .notEmpty()
        .withMessage("Autor je povinný.")
        .isLength({ max: 150 })
        .withMessage("Jméno autora nesmí obsahovat více než 150 znaků."),

    body("description")
        .optional({ values: "falsy" })
        .trim()
        .isLength({ max: 2000 })
        .withMessage("Popis nesmí obsahovat více než 2000 znaků."),

    body("pages")
        .notEmpty()
        .withMessage("Počet stran je povinný.")
        .isInt({ min: 1 })
        .withMessage("Počet stran musí být kladné celé číslo.")
        .toInt(),

    body("state")
        .trim()
        .notEmpty()
        .withMessage("Stav knihy je povinný.")
        .isIn([
            "Nový",
            "Velmi dobrý",
            "Dobrý",
            "Uspokojivý",
        ])
        .withMessage("Neplatný stav knihy."),

    body("price")
        .notEmpty()
        .withMessage("Cena je povinná.")
        .isFloat({ min: 0 })
        .withMessage("Cena musí být nezáporné číslo.")
        .toFloat(),

    body("delivery")
        .notEmpty()
        .withMessage("Cena dopravy je povinná.")
        .isFloat({ min: 0 })
        .withMessage("Cena dopravy musí být nezáporné číslo.")
        .toFloat(),

    body("base64")
        .optional({ values: "falsy" })
        .isString()
        .withMessage("Obrázek musí být ve formátu textového řetězce."),

    handleValidationErrors,
];


module.exports = {
    validateUser,
    validateLogin,
    validateBook,
};