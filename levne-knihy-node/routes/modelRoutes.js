const express = require("express");

const {
    getModels,
    getModel,
    getAvatar,
} = require("../controllers/modelController");

const router = express.Router();

router.get("/", getModels);

// Adresa avataru autora – načítá se zvlášť na pozadí, aby nezdržovala výpis modelů
router.get("/avatar/:author", getAvatar);

router.get("/:modelId", getModel);

module.exports = router;
