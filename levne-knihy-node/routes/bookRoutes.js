const express = require("express");

const {
    createBook,
    getBooks,
    deleteBook,
    updateBook,
} = require("../controllers/bookController");

const authenticate = require("../middleware/authMiddleware");

const router = express.Router();

router.post(
    "/pridat-inzerat",
    authenticate,
    createBook
);

router.get("/", getBooks);

router.delete(
    "/moje-inzeraty/:bookId",
    authenticate,
    deleteBook
);

router.post(
    "/moje-inzeraty/:bookId",
    authenticate,
    updateBook
);

module.exports = router;
