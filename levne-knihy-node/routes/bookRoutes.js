const express = require("express");

const {
    createBook,
    getBooks,
    deleteBook,
    updateBook,
} = require("../controllers/bookController");

const router = express.Router();

router.post("/pridat-inzerat", createBook);
router.get("/", getBooks);
router.delete("/moje-inzeraty/:bookId", deleteBook);
router.post("/moje-inzeraty/:bookId", updateBook);

module.exports = router;
