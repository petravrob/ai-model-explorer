const jwt = require("jsonwebtoken");

const User = require("../models/User");
const { JWT_SECRET } = require("../config/env");

const updateUser = async (req, res) => {
    try {
        const {
            fname,
            lname,
            email,
            phone,
            _id,
        } = req.body;

        const updatedUser = await User.findByIdAndUpdate(
            _id,
            {
                fname,
                lname,
                email,
                phone,
            },
            {
                new: true,
                runValidators: true,
            }
        );

        if (!updatedUser) {
            return res.status(404).json({
                status: "error",
                error: "User not found.",
            });
        }

        return res.status(200).json({
            status: "ok",
        });
    } catch (error) {
        console.error("User update failed:", error);

        return res.status(500).json({
            status: "error",
            error: "User update failed.",
        });
    }
};

const getCurrentUser = async (req, res) => {
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
};

module.exports = {
    updateUser,
    getCurrentUser,
};
