const mongoose = require("mongoose");

const UserDetailsSchema = new mongoose.Schema(
    {
        uname:  {type: String, unique: true},
        fname: String,
        lname: String,
        email: {type: String, unique: true},
        phone: String,
        password: String,
    },
    {
        collection: "UserInfo",
    }
);

mongoose.model("UserInfo", UserDetailsSchema)