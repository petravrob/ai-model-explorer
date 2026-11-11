const { apiMessage, readLanguage } = require("../services/apiMessages");

const notFound = (req, res) => {
    return res.status(404).json({
        status: "error",
        error: apiMessage("notFound", readLanguage(req)),
    });
};

const errorHandler = (error, req, res, next) => {
    console.error("Unhandled server error:", error);

    return res.status(500).json({
        status: "error",
        error: apiMessage("serverError", readLanguage(req)),
    });
};

module.exports = {
    notFound,
    errorHandler,
};
