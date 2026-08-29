const express = require("express");

const {
    updateUser,
    getCurrentUser,
} = require("../controllers/userController");

const authenticate = require("../middleware/authMiddleware");

const {
    validateUser,
} = require("../middleware/validationMiddleware");

const router = express.Router();


router.post(
    "/uzivatel",
    authenticate,
    validateUser,
    updateUser
);

router.post(
    "/",
    authenticate,
    getCurrentUser
);


module.exports = router;
