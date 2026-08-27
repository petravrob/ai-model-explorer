const mongoose = require("mongoose");
const { MONGO_URI } = require("./env");

const connectDatabase = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log("Connected to database");
    } catch (error) {
        console.error("Database connection failed:", error);
        throw error;
    }
};

module.exports = connectDatabase;
