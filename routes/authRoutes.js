// routes/authRoutes.js
const express = require("express");
const router = express.Router();

const auth = require("../controllers/authController");
const jwtAuth = require("../middleware/jwtAuth");
const roleGuard = require("../middleware/roleGuard");

router.post("/admin/login", auth.adminLogin);
router.post("/user/login", auth.userLoginOrRegister);
router.get("/me", jwtAuth, auth.me);

// Example admin-only route
router.get("/admin/secret", jwtAuth, roleGuard(["admin"]), (req, res) => {
  res.json({ message: "Admin secret area" });
});

module.exports = router;
