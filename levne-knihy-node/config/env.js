require("dotenv").config();

const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET;
const MONGO_URI = process.env.MONGO_URI;

// Volitelný token pro Hugging Face API (zvyšuje limity, bez něj stačí veřejná data)
const HUGGINGFACE_API_KEY = process.env.HUGGINGFACE_API_KEY || "";

if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined.");
}

if (!MONGO_URI) {
    throw new Error("MONGO_URI is not defined.");
}

module.exports = {
    PORT,
    JWT_SECRET,
    MONGO_URI,
    HUGGINGFACE_API_KEY,
};
