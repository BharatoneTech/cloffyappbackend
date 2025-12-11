const express = require("express");
const router = express.Router();

const reward = require("../controllers/rewardController");
const jwtAuth = require("../middleware/jwtAuth");
const roleGuard = require("../middleware/roleGuard");

// ADMIN ONLY
router.post("/", jwtAuth, roleGuard(["admin"]), reward.createReward);
router.get("/", jwtAuth, roleGuard(["admin"]), reward.getRewards);
router.get("/:id", jwtAuth, roleGuard(["admin"]), reward.getRewardById);
router.put("/:id", jwtAuth, roleGuard(["admin"]), reward.updateReward);
router.delete("/:id", jwtAuth, roleGuard(["admin"]), reward.deleteReward);

module.exports = router;
