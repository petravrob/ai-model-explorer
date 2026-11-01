const notFound = (req, res) => {
    return res.status(404).json({
        status: "error",
        error: "Adresa nebyla nalezena.",
    });
};

const errorHandler = (error, req, res, next) => {
    console.error("Unhandled server error:", error);

    return res.status(500).json({
        status: "error",
        error: "Došlo k chybě serveru.",
    });
};

module.exports = {
    notFound,
    errorHandler,
};
