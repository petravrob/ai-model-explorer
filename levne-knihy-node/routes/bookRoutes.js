const express = require("express");

const {
    createBook,
    getBooks,
    getBook,
    deleteBook,
    updateBook,
} = require("../controllers/bookController");

const authenticate = require("../middleware/authMiddleware");

const {
    validateBook,
} = require("../middleware/validationMiddleware");

const router = express.Router();

router.post(
    "/pridat-inzerat",
    authenticate,
    validateBook,
    createBook
);

router.get("/", getBooks);

router.get("/kniha/:bookId", getBook);

router.delete(
    "/moje-inzeraty/:bookId",
    authenticate,
    deleteBook
);

router.post(
    "/moje-inzeraty/:bookId",
    authenticate,
    validateBook,
    updateBook
);

module.exports = router;
