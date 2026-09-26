const app = require("./app");
const connectDatabase = require("./config/database");
const { PORT, SUMMARY_API_KEY, SUMMARY_MODEL } = require("./config/env");

const startServer = async () => {
    try {
        await connectDatabase();

        app.listen(PORT, "0.0.0.0", () => {
            console.log(`Server started on port ${PORT}`);

            // Ať je v logu hostingu hned vidět, jestli se popisy doplňují
            console.log(SUMMARY_API_KEY
                ? `Doplňování popisů modelů je zapnuté (${SUMMARY_MODEL}).`
                : "Doplňování popisů modelů je vypnuté (chybí SUMMARY_API_KEY).");
        });
    } catch (error) {
        console.error("Server startup failed:", error);
        process.exit(1);
    }
};

startServer();