// models/Reward.js
const { getDb } = require("../db/connection"); // your existing helper

// CREATE Reward
exports.create = async (data) => {
  const db = getDb();
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

// GET ALL REWARDS (used for admin + public listing)
exports.getAll = async () => {
  const db = getDb();
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
  const db = getDb();
  const [rows] = await db.execute(`SELECT * FROM rewards WHERE id = ?`, [id]);
  return rows[0];
};

// UPDATE REWARD
exports.update = async (id, data) => {
  const db = getDb();
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
  const db = getDb();
  const [result] = await db.execute(`DELETE FROM rewards WHERE id=?`, [id]);
  return result;
};

/* ---------- USER / TRANSACTIONAL HELPERS ---------- */

// return a connection from pool (so controller can transaction)
exports.getConnection = async () => {
  const db = getDb();
  // assume getDb() returns a mysql2 Pool
  return await db.getConnection();
};

// get user's stars FOR UPDATE (within a transaction)
exports.getUserStarsForUpdate = async (conn, userId) => {
  const [rows] = await conn.execute(`SELECT id, user_id, stars FROM user_stars WHERE user_id = ? FOR UPDATE`, [userId]);
  return rows[0];
};

// create user_stars row (if absent)
exports.createUserStars = async (conn, userId, stars = 0) => {
  const [res] = await conn.execute(`INSERT INTO user_stars (user_id, stars, created_at, updated_at) VALUES (?, ?, NOW(), NOW())`, [userId, stars]);
  return res.insertId;
};

// update user_stars (within transaction)
exports.updateUserStars = async (conn, userId, stars) => {
  const [res] = await conn.execute(`UPDATE user_stars SET stars = ?, updated_at = NOW() WHERE user_id = ?`, [stars, userId]);
  return res;
};

// choose any reward to assign (simple strategy: first row)
exports.getAnyForAssign = async (conn) => {
  // if conn provided use it, else fallback to pool
  if (conn) {
    const [rows] = await conn.execute(`SELECT * FROM rewards ORDER BY id ASC LIMIT 1`);
    return rows[0];
  } else {
    const db = getDb();
    const [rows] = await db.execute(`SELECT * FROM rewards ORDER BY id ASC LIMIT 1`);
    return rows[0];
  }
};

// insert into user_rewards (within transaction)
exports.insertUserReward = async (conn, userId, rewardId) => {
  const [res] = await conn.execute(
    `INSERT INTO user_rewards (user_id, reward_id, status, created_at, updated_at) VALUES (?, ?, 'ACTIVE', NOW(), NOW())`,
    [userId, rewardId]
  );
  return res.insertId;
};

// get user's claimed rewards (joined with reward info)
exports.getUserRewards = async (userId) => {
  const db = getDb();
  const [rows] = await db.execute(
    `SELECT ur.id as user_reward_id, ur.status, ur.created_at as claimed_at, r.* 
     FROM user_rewards ur 
     JOIN rewards r ON ur.reward_id = r.id
     WHERE ur.user_id = ?
     ORDER BY ur.created_at DESC`,
    [userId]
  );
  return rows;
};

// count active user rewards
exports.countActiveUserRewards = async (userId) => {
  const db = getDb();
  const [rows] = await db.execute(`SELECT COUNT(*) as cnt FROM user_rewards WHERE user_id = ? AND status = 'ACTIVE'`, [userId]);
  return rows[0]?.cnt || 0;
};
