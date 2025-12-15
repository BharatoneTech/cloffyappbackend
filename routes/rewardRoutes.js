// routes/rewardRoutes.js
const express = require("express");
const router = express.Router();

const reward = require("../controllers/rewardController");
const jwtAuth = require("../middleware/jwtAuth");
const roleGuard = require("../middleware/roleGuard");

// ---------- ADMIN routes (protected) ----------
// create / manage rewards (admin)
router.post("/", jwtAuth, roleGuard(["admin"]), reward.createReward);

// admin list / single / update / delete (stayed under /admin)
router.get("/admin", jwtAuth, roleGuard(["admin"]), reward.getRewards);
router.get("/admin/:id", jwtAuth, roleGuard(["admin"]), reward.getRewardById);
router.put("/admin/:id", jwtAuth, roleGuard(["admin"]), reward.updateReward);
router.delete("/admin/:id", jwtAuth, roleGuard(["admin"]), reward.deleteReward);

// ---------- PUBLIC / USER routes ----------
// public list of rewards (no auth)
router.get("/", reward.getAvailableRewards);

// user's claimed rewards (authenticated)
// 1) for the logged-in user (no param) -> use req.user.id inside controller
router.get("/user", jwtAuth, reward.getUserRewards);

// 2) for a specific user id (param) -> controller will read req.params.userId
router.get("/user/:userId", jwtAuth, reward.getUserRewards);

// claim reward (authenticated)
router.post("/claim", jwtAuth, reward.claimReward);

module.exports = router;
