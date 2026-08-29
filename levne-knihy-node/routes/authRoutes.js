const express = require("express");

const {
    register,
    login,
} = require("../controllers/authController");

const {
    validateUser,
    validateLogin,
} = require("../middleware/validationMiddleware");

const router = express.Router();

router.post(
    "/registrovat-se",
    validateUser,
    register
);

router.post(
    "/prihlasit-se",
    validateLogin,
    login
);

module.exports = router;
