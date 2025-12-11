// models/additionalIngredientModel.js
const { getDb } = require("../db/connection");

const AdditionalIngredient = {
  // get all additional ingredients from DB
  findAll: async () => {
    const pool = getDb();
    const [rows] = await pool.query(
      "SELECT id, category_id, product_id, ingredients, price FROM additional_ingredients"
    );
    return rows;
  },
};

module.exports = AdditionalIngredient;
