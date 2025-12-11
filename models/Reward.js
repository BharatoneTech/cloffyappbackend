// models/Reward.js
const { getDb } = require("../db/connection");

// CREATE Reward
exports.create = async (data) => {
  const db = getDb();  // ✅ NOW safe
  const [result] = await db.execute(
    `INSERT INTO rewards 
      (coupon_code, category_id, product_id, apply_on, buy, get, percentage) 
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      data.coupon_code,
      data.category_id || null,
      data.product_id || null,
      data.apply_on,
      data.buy || null,
      data.get || null,
      data.percentage || null,
    ]
  );
  return result;
};

// GET ALL REWARDS
exports.getAll = async () => {
  const db = getDb();  // ✅ safe
  const [rows] = await db.execute(
    `SELECT r.*, 
      c.category_name,
      p.product_name
     FROM rewards r
     LEFT JOIN categories c ON r.category_id = c.id
     LEFT JOIN products p ON r.product_id = p.id
     ORDER BY r.id DESC`
  );
  return rows;
};

// GET SINGLE REWARD
exports.getById = async (id) => {
  const db = getDb();  // ✅ safe
  const [rows] = await db.execute(
    `SELECT * FROM rewards WHERE id = ?`,
    [id]
  );
  return rows[0];
};

// UPDATE REWARD
exports.update = async (id, data) => {
  const db = getDb();  // ✅ safe
  const [result] = await db.execute(
    `UPDATE rewards 
     SET coupon_code=?, category_id=?, product_id=?, apply_on=?, buy=?, get=?, percentage=?
     WHERE id=?`,
    [
      data.coupon_code,
      data.category_id || null,
      data.product_id || null,
      data.apply_on,
      data.buy || null,
      data.get || null,
      data.percentage || null,
      id,
    ]
  );
  return result;
};

// DELETE REWARD
exports.remove = async (id) => {
  const db = getDb();  // ✅ safe
  const [result] = await db.execute(
    `DELETE FROM rewards WHERE id=?`,
    [id]
  );
  return result;
};
