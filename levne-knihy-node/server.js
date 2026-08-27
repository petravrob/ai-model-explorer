const app = require("./app");
const connectDatabase = require("./config/database");
const { PORT } = require("./config/env");

const startServer = async () => {
    try {
        await connectDatabase();

        app.listen(PORT, "0.0.0.0", () => {
            console.log(`Server started on port ${PORT}`);
        });
    } catch (error) {
        console.error("Server startup failed:", error);
        process.exit(1);
    }
};

startServer();