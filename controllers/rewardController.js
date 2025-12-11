// controllers/rewardController.js
const Reward = require("../models/Reward");

exports.createReward = async (req, res) => {
  try {
    let { apply_on } = req.body;

    // 🔥 FIX ENUM — Convert to uppercase & validate
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
