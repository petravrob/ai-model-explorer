const express = require("express");

const {
    register,
    login,
} = require("../controllers/authController");

const router = express.Router();

router.post("/registrovat-se", register);
router.post("/prihlasit-se", login);

module.exports = router;
