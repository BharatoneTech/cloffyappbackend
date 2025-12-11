// routes/orderRoutes.js
const express = require("express");
const router = express.Router();

const jwtAuth = require("../middleware/jwtAuth");

const {
  createOrder,
  getUserOrders,
  getOrderById,
  getOrderWithItems,
  getAdminOrders,
  updateOrderStatus,
} = require("../controllers/orderController");

// ⭐ Simple admin guard (assumes req.user.role === 'admin')
function isAdmin(req, res, next) {
  if (req.user && req.user.role === "admin") {
    return next();
  }
  return res.status(403).json({ message: "Forbidden: Admins only" });
}

// POST /api/orders → create order
router.post("/", jwtAuth, createOrder);

// GET /api/orders/my → user order history
router.get("/my", jwtAuth, getUserOrders);

// ADMIN: GET ALL ORDERS
// GET /api/orders
router.get("/", jwtAuth, isAdmin, getAdminOrders);

// FULL DETAILS (user or admin)
// GET /api/orders/:id/full
router.get("/:id/full", jwtAuth, getOrderWithItems);

// GET /api/orders/:id → single order (simple)
router.get("/:id", jwtAuth, getOrderById);

// ADMIN: UPDATE STATUS
// PATCH /api/orders/:id/status
router.patch("/:id/status", jwtAuth, isAdmin, updateOrderStatus);

module.exports = router;
