const User = require("../models/User");

const updateUser = async (req, res) => {
    try {
        const {
            fname,
            lname,
            email,
            phone,
        } = req.body;

        const updatedUser = await User.findOneAndUpdate(
            { uname: req.user.uname },
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
        const user = await User.findOne({
            uname: req.user.uname,
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
        console.error("Fetching current user failed:", error);

        return res.status(500).json({
            status: "error",
            error: "Failed to fetch current user.",
        });
    }
};

module.exports = {
    updateUser,
    getCurrentUser,
};
