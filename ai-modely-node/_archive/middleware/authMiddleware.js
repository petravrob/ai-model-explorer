const jwt = require("jsonwebtoken");

const { JWT_SECRET } = require("../config/env");

const authenticate = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                status: "error",
                error: "Authentication required.",
            });
        }

        const token = authHeader.split(" ")[1];

        const decoded = jwt.verify(token, JWT_SECRET);

        req.user = decoded;

        next();
    } catch (error) {
        console.error("Authentication failed:", error);

        return res.status(401).json({
            status: "error",
            error: "Invalid or expired token.",
        });
    }
};

module.exports = authenticate;
