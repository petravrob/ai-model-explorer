const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        uname: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        fname: {
            type: String,
            required: true,
            trim: true,
        },
        lname: {
            type: String,
            required: true,
            trim: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true,
        },
        phone: {
            type: String,
            trim: true,
        },
        password: {
            type: String,
            required: true,
        },
    },
    {
        collection: "UserInfo",
        timestamps: true,
    }
);

module.exports = mongoose.model("User", userSchema);
