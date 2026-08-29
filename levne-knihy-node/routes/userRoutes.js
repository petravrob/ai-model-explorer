const express = require("express");

const {
    updateUser,
    getCurrentUser,
} = require("../controllers/userController");

const authenticate = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/uzivatel", authenticate, updateUser);

router.post("/", authenticate, getCurrentUser);

module.exports = router;
