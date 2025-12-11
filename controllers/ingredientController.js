// backend/controllers/ingredientController.js
const { getDb } = require('../db/connection');

exports.createIngredient = async (req, res, next) => {
  try {
    const { category_id, product_id, ingredients, price } = req.body;
    if (!category_id || !product_id || !ingredients) return res.status(400).json({ success:false, message:'category_id, product_id, ingredients required' });

    const pool = getDb();
    const [result] = await pool.query(
      `INSERT INTO additional_ingredients (category_id, product_id, ingredients, price, created_at, updated_at) VALUES (?, ?, ?, ?, NOW(), NOW())`,
      [category_id, product_id, ingredients, price || 0]
    );
    res.json({ success:true, id: result.insertId });
  } catch (err) { next(err) }
};

exports.getAllIngredients = async (req, res, next) => {
  try {
    const pool = getDb();
    const [rows] = await pool.query(`SELECT ai.*, c.category_name, p.product_name FROM additional_ingredients ai LEFT JOIN categories c ON ai.category_id = c.id LEFT JOIN products p ON ai.product_id = p.id ORDER BY ai.id DESC`);
    res.json({ success:true, data: rows });
  } catch (err) { next(err) }
};

exports.getIngredientById = async (req, res, next) => {
  try {
    const pool = getDb();
    const [rows] = await pool.query(`SELECT * FROM additional_ingredients WHERE id = ?`, [req.params.id]);
    if (!rows.length) return res.status(404).json({ success:false, message:'Not found' });
    res.json({ success:true, data: rows[0] });
  } catch (err) { next(err) }
};

exports.updateIngredient = async (req, res, next) => {
  try {
    const id = req.params.id;
    const { category_id, product_id, ingredients, price } = req.body;
    const pool = getDb();
    await pool.query(`UPDATE additional_ingredients SET category_id=?, product_id=?, ingredients=?, price=?, updated_at=NOW() WHERE id=?`, [category_id, product_id, ingredients, price || 0, id]);
    res.json({ success:true, message:'updated' });
  } catch (err) { next(err) }
};

exports.deleteIngredient = async (req, res, next) => {
  try {
    const id = req.params.id;
    const pool = getDb();
    await pool.query(`DELETE FROM additional_ingredients WHERE id = ?`, [id]);
    res.json({ success:true, message:'deleted' });
  } catch (err) { next(err) }
};

exports.getByProduct = async (req, res, next) => {
  try {
    const pool = getDb();
    const productId = req.params.productId;
    const [rows] = await pool.query(`SELECT * FROM additional_ingredients WHERE product_id = ? ORDER BY id DESC`, [productId]);
    res.json({ success:true, data: rows });
  } catch (err) { next(err) }
};
