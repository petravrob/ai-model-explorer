js
require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

require("./userDetails");
require("./bookDetails");

const app = express();


// Configuration
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET;
const MONGO_URI = process.env.MONGO_URI;

if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined.");
}

if (!MONGO_URI) {
    throw new Error("MONGO_URI is not defined.");
}


// Database
mongoose
    .connect(MONGO_URI)
    .then(() => {
        console.log("Connected to database");
    })
    .catch((error) => {
        console.error("Database connection failed:", error);
    });


// Middleware
app.use(cors());

app.use(
    express.json({
        limit: "300mb",
    })
);

app.use(
    express.urlencoded({
        limit: "300mb",
        extended: true,
    })
);


// Models
const User = mongoose.model("UserInfo");
const Book = mongoose.model("BookInfo");


// Authentication
app.post("/registrovat-se", async (req, res) => {
    try {
        const {
            uname,
            fname,
            lname,
            email,
            phone,
            password,
        } = req.body;

        const [usedUname, usedEmail] = await Promise.all([
            User.findOne({ uname }),
            User.findOne({ email }),
        ]);

        if (usedUname) {
            return res.status(409).json({
                error: "Username already in use.",
            });
        }

        if (usedEmail) {
            return res.status(409).json({
                error: "Email already in use.",
            });
        }

        const encryptedPassword = await bcrypt.hash(password, 10);

        await User.create({
            uname,
            fname,
            lname,
            email,
            phone,
            password: encryptedPassword,
        });

        return res.status(201).json({
            status: "ok",
        });
    } catch (error) {
        console.error("Registration failed:", error);

        return res.status(500).json({
            status: "error",
            error: "Registration failed.",
        });
    }
});

app.post("/prihlasit-se", async (req, res) => {
    try {
        const { uname, password } = req.body;

        const user = await User.findOne({ uname });

        if (!user) {
            return res.status(404).json({
                error: "User not found.",
            });
        }

        const passwordIsValid = await bcrypt.compare(
            password,
            user.password
        );

        if (!passwordIsValid) {
            return res.status(401).json({
                status: "error",
                error: "Invalid password.",
            });
        }

        const token = jwt.sign(
            {
                uname: user.uname,
            },
            JWT_SECRET
        );

        return res.status(200).json({
            status: "ok",
            data: token,
        });
    } catch (error) {
        console.error("Login failed:", error);

        return res.status(500).json({
            status: "error",
            error: "Login failed.",
        });
    }
});


// User
app.post("/uzivatel", async (req, res) => {
    try {
        const {
            fname,
            lname,
            email,
            phone,
            _id,
        } = req.body;

        await User.findByIdAndUpdate(_id, {
            fname,
            lname,
            email,
            phone,
        });

        return res.status(200).json({
            status: "ok",
        });
    } catch (error) {
        console.error("User update failed:", error);

        return res.status(500).json({
            status: "error",
        });
    }
});

app.post("/", async (req, res) => {
    try {
        const { token } = req.body;

        const decodedToken = jwt.verify(token, JWT_SECRET);

        const user = await User.findOne({
            uname: decodedToken.uname,
        });

        if (!user) {
            return res.status(404).json({
                status: "error",
                error: "User not found.",
            });
        }

        return res.status(200).json({
            status: "ok",
            data: user,
        });
    } catch (error) {
        console.error("User authentication failed:", error);

        return res.status(401).json({
            status: "error",
            error: "Invalid or expired token.",
        });
    }
});


// Books
app.post("/pridat-inzerat", async (req, res) => {
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
        });
    }
});

app.get("/", async (req, res) => {
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
        });
    }
});

app.delete("/moje-inzeraty/:bookId", async (req, res) => {
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
        });
    }
});

app.post("/moje-inzeraty/:bookId", async (req, res) => {
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
        });
    }
});


// Server
app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server started on port ${PORT}`);
});
