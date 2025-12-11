// controllers/additionalIngredientController.js
const AdditionalIngredient = require("../models/additionalIngredientModel");

exports.getAdditionalIngredients = async (req, res) => {
  try {
    const rows = await AdditionalIngredient.findAll();
    return res.json({
      additional_ingredients: rows,
    });
  } catch (err) {
    console.error("❌ Error fetching additional ingredients:", err);
    return res.status(500).json({ message: "Server Error" });
  }
};
