const mongoose = require("mongoose");

const bookSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        author: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
            trim: true,
        },
        pages: {
            type: Number,
            required: true,
            min: 1,
        },
        state: { // TODO: enum
            type: String,
            required: true,
            trim: true,
        },
        price: {
            type: Number,
            required: true,
            min: 0,
        },
        delivery: {
            type: Number,
            required: true,
            min: 0,
        },
        fname: {
            type: String,
            required: true,
        },
        lname: {
            type: String,
            required: true,
        },
        phone: {
            type: String,
            required: true,
        },
        uname: {
            type: String,
            required: true,
        },
        image: {
            type: String,
        },
    },
    {
        collection: "BookInfo",
        timestamps: true,
    }
);

module.exports = mongoose.model("Book", bookSchema);
