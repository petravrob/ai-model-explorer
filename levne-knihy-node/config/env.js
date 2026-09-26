require("dotenv").config();

const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET;
const MONGO_URI = process.env.MONGO_URI;

// Volitelný token pro Hugging Face API (zvyšuje limity, bez něj stačí veřejná data)
const HUGGINGFACE_API_KEY = process.env.HUGGINGFACE_API_KEY || "";

// Volitelný klíč k poskytovateli českých popisů (skript scripts/generateDescriptions.js).
// Vyhovuje jakákoli služba s OpenAI kompatibilním rozhraním (Groq, OpenRouter, Mistral, Ollama…).
const SUMMARY_API_KEY = process.env.SUMMARY_API_KEY || "";
const SUMMARY_API_URL = process.env.SUMMARY_API_URL || "https://api.groq.com/openai/v1";
const SUMMARY_MODEL = process.env.SUMMARY_MODEL || "llama-3.3-70b-versatile";

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
    SUMMARY_API_KEY,
    SUMMARY_API_URL,
    SUMMARY_MODEL,
};
