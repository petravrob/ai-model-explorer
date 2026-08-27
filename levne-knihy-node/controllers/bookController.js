const Book = require("../models/Book");

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
            fname,
            lname,
            phone,
            uname,
        } = req.body;

        await Book.create({
            name,
            author,
            description,
            pages,
            state,
            price,
            image: base64,
            delivery,
            fname,
            lname,
            phone,
            uname,
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

const deleteBook = async (req, res) => {
    try {
        const { bookId } = req.params;

        const deletedBook = await Book.findByIdAndDelete(bookId);

        if (!deletedBook) {
            return res.status(404).json({
                status: "error",
                error: "Book not found.",
            });
        }

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

        const {
            name,
            author,
            description,
            pages,
            state,
            price,
            delivery,
            fname,
            lname,
            phone,
            uname,
        } = req.body;

        const updatedBook = await Book.findByIdAndUpdate(
            bookId,
            {
                name,
                author,
                description,
                pages,
                state,
                price,
                delivery,
                fname,
                lname,
                phone,
                uname,
            },
            {
                new: true,
                runValidators: true,
            }
        );

        if (!updatedBook) {
            return res.status(404).json({
                status: "error",
                error: "Book not found.",
            });
        }

        return res.status(200).json({
            status: "ok",
            data: updatedBook,
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
    deleteBook,
    updateBook,
};
