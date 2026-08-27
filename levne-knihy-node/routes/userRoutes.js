const express = require("express");

const {
    updateUser,
    getCurrentUser,
} = require("../controllers/userController");

const router = express.Router();

router.post("/uzivatel", updateUser);
router.post("/", getCurrentUser);

module.exports = router;
