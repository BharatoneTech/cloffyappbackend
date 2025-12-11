// routes/userExtrasRoutes.js
const express = require("express");
const router = express.Router();
const jwtAuth = require("../middleware/jwtAuth");

const {
  getUserStars,
  getUserRewards,
} = require("../controllers/userExtrasController");

router.get("/stars", jwtAuth, getUserStars);
router.get("/rewards", jwtAuth, getUserRewards);

module.exports = router;
