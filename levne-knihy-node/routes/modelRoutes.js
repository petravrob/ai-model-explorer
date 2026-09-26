const express = require("express");

const {
    getModels,
    getModel,
    getModelCard,
    getAvatar,
    createDescriptions,
    createInsights,
} = require("../controllers/modelController");

const router = express.Router();

router.get("/", getModels);

// Adresa avataru autora – načítá se zvlášť na pozadí, aby nezdržovala výpis modelů
router.get("/avatar/:author", getAvatar);

// Popisky se generují pro modely, které jsou na stránce vidět (maximálně tři na požadavek)
router.post("/descriptions", createDescriptions);

// Přehledy z dokumentace se připravují pro otevřený model (jednou na verzi dokumentace)
router.post("/:modelId/insights", createInsights);

// Text model card (README) se načítá až pro otevřený detail modelu
router.get("/:modelId/card", getModelCard);

router.get("/:modelId", getModel);

module.exports = router;
