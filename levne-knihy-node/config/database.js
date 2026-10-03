const mongoose = require("mongoose");
const { MONGO_URI } = require("./env");

const connectDatabase = async () => {
    try {
        await mongoose.connect(MONGO_URI, {
            // Indexy se staví jednorázově skriptem (npm run create:indexes), ne při každém startu
            autoIndex: false,
        });
        console.log("Connected to database");
    } catch (error) {
        console.error("Database connection failed:", error);
        throw error;
    }
};

module.exports = connectDatabase;
