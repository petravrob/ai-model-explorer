const app = require("./app");
const connectDatabase = require("./config/database");
const { PORT, SUMMARY_ENABLED, SUMMARY_PROVIDERS } = require("./config/env");

const startServer = async () => {
    try {
        await connectDatabase();

        app.listen(PORT, "0.0.0.0", () => {
            console.log(`Server started on port ${PORT}`);

            // Ať je v logu hostingu hned vidět, jestli a čím se texty doplňují
            console.log(SUMMARY_ENABLED
                ? `Doplňování textů je zapnuté (${SUMMARY_PROVIDERS.map((provider) => provider.model).join(" → ")}).`
                : "Doplňování textů je vypnuté (chybí SUMMARY_API_KEY).");
        });
    } catch (error) {
        console.error("Server startup failed:", error);
        process.exit(1);
    }
};

startServer();