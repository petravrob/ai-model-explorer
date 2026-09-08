const express = require("express");

const {
    getModels,
    getModel,
} = require("../controllers/modelController");

const router = express.Router();

router.get("/", getModels);

router.get("/:modelId", getModel);

module.exports = router;
