// controllers/userExtrasController.js
const { getDb } = require("../db/connection");

exports.getUserStars = async (req, res) => {
  try {
    const db = getDb();
    const userId = req.user.id;

    const [rows] = await db.query(
      `SELECT stars FROM user_stars WHERE user_id = ? LIMIT 1`,
      [userId]
    );

    return res.json({
      success: true,
      stars: rows.length ? rows[0].stars : 0,
    });
  } catch (err) {
    return res.status(500).json({ message: "Failed to fetch stars" });
  }
};

exports.getUserRewards = async (req, res) => {
  try {
    const db = getDb();
    const userId = req.user.id;

    const [rows] = await db.query(
      `
      SELECT 
        ur.id,
        ur.status,
        rw.coupon_code,
        rw.apply_on,
        rw.percentage,
        rw.buy,
        rw.get,
        rw.category_id,
        rw.product_id
      FROM user_rewards ur
      JOIN rewards rw ON rw.id = ur.reward_id
      WHERE ur.user_id = ?
      ORDER BY ur.created_at DESC
      `,
      [userId]
    );

    return res.json({
      success: true,
      rewards: rows,
    });
  } catch (err) {
    return res.status(500).json({ message: "Failed to fetch rewards" });
  }
};
