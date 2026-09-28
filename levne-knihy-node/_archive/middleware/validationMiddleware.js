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


module.exports = {
    validateUser,
    validateLogin,
};
