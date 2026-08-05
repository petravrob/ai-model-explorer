const mongoose = require("mongoose");

const BookDetailsSchema = new mongoose.Schema(
    {
        name:  String,
        author: String,
        description: String,
        pages: Number,
        state: String,
        price: Number,
        delivery: Number,
        fname: String,
        lname: String,
        uname: String,
        phone: String,
        image: String,
    },
    {
        collection: "BookInfo",
    }
);

mongoose.model("BookInfo", BookDetailsSchema)