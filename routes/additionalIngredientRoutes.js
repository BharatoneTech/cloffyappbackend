// routes/additionalIngredientRoutes.js
const express = require("express");
const router = express.Router();
const {
  getAdditionalIngredients,
} = require("../controllers/additionalIngredientController");

// GET /api/additional-ingredients
router.get("/additional-ingredients", getAdditionalIngredients);

module.exports = router;
