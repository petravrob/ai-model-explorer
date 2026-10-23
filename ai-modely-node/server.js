const app = require("./app");
const connectDatabase = require("./config/database");
const { PORT, SUMMARY_ENABLED, SUMMARY_PROVIDERS } = require("./config/env");
const { startGenerationWorker } = require("./services/generationQueue");
const { getSortedModels } = require("./services/huggingFaceService");
const { DEFAULT_PAGE_SIZE } = require("./config/paging");

const startServer = async () => {
    try {
        await connectDatabase();

        // Generování popisků a přehledů běží na pozadí mimo požadavky klientů
        startGenerationWorker();

        // Nejoblíbenější výpis se natáhne už při startu, ať první návštěva nečeká na Hugging Face.
        // Musí jít o stejnou adresu, jakou si vyžádá klient, jinak se do paměti nechytí.
        getSortedModels("popularity", DEFAULT_PAGE_SIZE).catch((error) => {
            console.error("Prewarming model list failed:", error.message);
        });

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