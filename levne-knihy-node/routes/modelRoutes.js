const express = require("express");

const {
    getModels,
    getModel,
    getAvatar,
    createDescriptions,
} = require("../controllers/modelController");

const router = express.Router();

router.get("/", getModels);

// Adresa avataru autora – načítá se zvlášť na pozadí, aby nezdržovala výpis modelů
router.get("/avatar/:author", getAvatar);

// Popisky se generují pro modely, které jsou na stránce vidět (maximálně tři na požadavek)
router.post("/descriptions", createDescriptions);

router.get("/:modelId", getModel);

module.exports = router;
