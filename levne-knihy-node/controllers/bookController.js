const mongoose = require("mongoose");

const Book = require("../models/Book");
const User = require("../models/User");

const createBook = async (req, res) => {
    try {
        const {
            name,
            author,
            description,
            pages,
            state,
            price,
            base64,
            delivery,
        } = req.body;

        const user = await User.findOne({
            uname: req.user.uname,
        });

        if (!user) {
            return res.status(404).json({
                status: "error",
                error: "User not found.",
            });
        }

        await Book.create({
            name,
            author,
            description,
            pages,
            state,
            price,
            image: base64,
            delivery,
            fname: user.fname,
            lname: user.lname,
            phone: user.phone,
            uname: user.uname,
        });

        return res.status(201).json({
            status: "ok",
        });
    } catch (error) {
        console.error("Book creation failed:", error);

        return res.status(500).json({
            status: "error",
            error: "Book creation failed.",
        });
    }
};

const getBooks = async (req, res) => {
    try {
        const books = await Book.find();

        return res.status(200).json({
            status: "ok",
            data: books,
        });
    } catch (error) {
        console.error("Fetching books failed:", error);

        return res.status(500).json({
            status: "error",
            error: "Fetching books failed.",
        });
    }
};

const getBook = async (req, res) => {
    try {
        const { bookId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(bookId)) {
            return res.status(404).json({
                status: "error",
                error: "Kniha nebyla nalezena.",
            });
        }

        const book = await Book.findById(bookId);

        if (!book) {
            return res.status(404).json({
                status: "error",
                error: "Kniha nebyla nalezena.",
            });
        }

        return res.status(200).json({
            status: "ok",
            data: book,
        });
    } catch (error) {
        console.error("Fetching book failed:", error);

        return res.status(500).json({
            status: "error",
            error: "Fetching book failed.",
        });
    }
};

const deleteBook = async (req, res) => {
    try {
        const { bookId } = req.params;

        const book = await Book.findById(bookId);

        if (!book) {
            return res.status(404).json({
                status: "error",
                error: "Book not found.",
            });
        }

        if (book.uname !== req.user.uname) {
            return res.status(403).json({
                status: "error",
                error: "You are not allowed to delete this book.",
            });
        }

        await Book.findByIdAndDelete(bookId);

        return res.status(200).json({
            status: "ok",
        });
    } catch (error) {
        console.error("Book deletion failed:", error);

        return res.status(500).json({
            status: "error",
            error: "Book deletion failed.",
        });
    }
};

const updateBook = async (req, res) => {
    try {
        const { bookId } = req.params;

        const book = await Book.findById(bookId);

        if (!book) {
            return res.status(404).json({
                status: "error",
                error: "Book not found.",
            });
        }

        if (book.uname !== req.user.uname) {
            return res.status(403).json({
                status: "error",
                error: "You are not allowed to update this book.",
            });
        }

        const {
            name,
            author,
            description,
            pages,
            state,
            price,
            base64,
            delivery,
        } = req.body;

        const updateData = {
            name,
            author,
            description,
            pages,
            state,
            price,
            delivery,
        };

        if (base64 !== undefined) {
            updateData.image = base64;
        }

        await Book.findByIdAndUpdate(
            bookId,
            updateData,
            {
                new: true,
                runValidators: true,
            }
        );

        return res.status(200).json({
            status: "ok",
        });
    } catch (error) {
        console.error("Book update failed:", error);

        return res.status(500).json({
            status: "error",
            error: "Book update failed.",
        });
    }
};

module.exports = {
    createBook,
    getBooks,
    getBook,
    deleteBook,
    updateBook,
};
