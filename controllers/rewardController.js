// controllers/rewardController.js
const Reward = require("../models/Reward");

// ---------- ADMIN: create reward (unchanged logic, with validation)
exports.createReward = async (req, res) => {
  try {
    let { apply_on } = req.body;

    if (apply_on) apply_on = apply_on.toUpperCase();
    if (!["PRODUCT", "PRICE"].includes(apply_on)) {
      return res.status(400).json({
        success: false,
        message: "Invalid apply_on value. Must be PRODUCT or PRICE",
      });
    }

    req.body.apply_on = apply_on;

    const result = await Reward.create(req.body);

    res.json({
      success: true,
      message: "Reward created",
      id: result.insertId,
    });
  } catch (err) {
    console.log("Create reward error:", err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// ---------- ADMIN: get all (kept, but moved to /admin route in router)
exports.getRewards = async (req, res) => {
  try {
    const data = await Reward.getAll();
    res.json({ success: true, data });
  } catch (err) {
    console.log("Fetch reward error:", err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

exports.getRewardById = async (req, res) => {
  try {
    const data = await Reward.getById(req.params.id);
    if (!data) return res.status(404).json({ success: false, message: "Not found" });
    res.json({ success: true, data });
  } catch (err) {
    console.log("Fetch single reward error:", err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

exports.updateReward = async (req, res) => {
  try {
    await Reward.update(req.params.id, req.body);
    res.json({ success: true, message: "Reward updated" });
  } catch (err) {
    console.log("Update reward error:", err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

exports.deleteReward = async (req, res) => {
  try {
    await Reward.remove(req.params.id);
    res.json({ success: true, message: "Reward deleted" });
  } catch (err) {
    console.log("Delete reward error:", err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

/* ---------- PUBLIC: list rewards (no auth) ---------- */
exports.getAvailableRewards = async (req, res) => {
  try {
    const data = await Reward.getAll();
    res.json({ success: true, data });
  } catch (err) {
    console.log("Fetch available rewards error:", err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

/* ---------- USER: get user's claimed rewards ---------- */
exports.getUserRewards = async (req, res) => {
  try {
    const userId = req.user?.id || Number(req.params.userId);
    if (!userId) return res.status(400).json({ success: false, message: "userId required" });

    const rows = await Reward.getUserRewards(userId);
    res.json({ success: true, rewards: rows });
  } catch (err) {
    console.log("Fetch user rewards error:", err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

/*
  POST /api/rewards/claim
  body: { reward_id?: number } (optional: pick a specific reward)
  Authenticated route: req.user.id required
  Transactional: verifies user_stars >= THRESHOLD, inserts user_rewards and deducts stars.
*/
exports.claimReward = async (req, res) => {
  const userId = req.user?.id || Number(req.body.user_id);
  const rewardId = req.body.reward_id ? Number(req.body.reward_id) : null;
  const THRESHOLD = 10; // change if needed

  if (!userId) return res.status(400).json({ success: false, message: "Missing user id" });

  let conn;
  try {
    conn = await Reward.getConnection(); // model exposes getConnection()
    await conn.beginTransaction();

    // fetch (for update) user's stars
    const userStarsRow = await Reward.getUserStarsForUpdate(conn, userId);
    let currentStars = 0;
    if (!userStarsRow) {
      // create a row if none exists
      await Reward.createUserStars(conn, userId, 0);
      currentStars = 0;
    } else {
      currentStars = Number(userStarsRow.stars || 0);
    }

    if (currentStars < THRESHOLD) {
      await conn.rollback();
      return res.status(400).json({ success: false, message: "Not enough stars to claim reward", currentStars });
    }

    // choose reward
    let chosenReward;
    if (rewardId) {
      chosenReward = await Reward.getById(rewardId);
      if (!chosenReward) {
        await conn.rollback();
        return res.status(404).json({ success: false, message: "Reward not found" });
      }
    } else {
      // pick the first available reward (simple strategy — modify if needed)
      const avail = await Reward.getAnyForAssign(conn);
      if (!avail) {
        await conn.rollback();
        return res.status(404).json({ success: false, message: "No rewards configured" });
      }
      chosenReward = avail;
    }

    // insert into user_rewards
    const insertId = await Reward.insertUserReward(conn, userId, chosenReward.id);

    // deduct stars (subtract THRESHOLD)
    const newStars = Math.max(0, currentStars - THRESHOLD);
    await Reward.updateUserStars(conn, userId, newStars);

    await conn.commit();

    // compute user's active reward count
    const activeCount = await Reward.countActiveUserRewards(userId);

    return res.json({
      success: true,
      message: "Reward claimed",
      reward: chosenReward,
      user_reward_id: insertId,
      remaining_stars: newStars,
      rewards_count: activeCount,
    });
  } catch (err) {
    if (conn) {
      try { await conn.rollback(); } catch (e) {}
    }
    console.error("claimReward err:", err);
    return res.status(500).json({ success: false, message: "Failed to claim reward" });
  } finally {
    if (conn) try { conn.release(); } catch (e) {}
  }
};
