const notFound = (req, res) => {
    return res.status(404).json({
        status: "error",
        error: "Endpoint not found.",
    });
};

const errorHandler = (error, req, res, next) => {
    console.error("Unhandled server error:", error);

    return res.status(500).json({
        status: "error",
        error: "Internal server error.",
    });
};

module.exports = {
    notFound,
    errorHandler,
};
