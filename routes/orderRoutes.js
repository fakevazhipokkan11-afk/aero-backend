// routes/orderRoutes.js
// ──────────────────────────────────────────────
// Order routes — all protected by JWT middleware.
// Admin route additionally requires adminOnly middleware.
// ──────────────────────────────────────────────

const express = require("express");
const router = express.Router();

const {
  placeOrder,
  getUserOrders,
  trackOrder,
  getAllOrders,
} = require("../controllers/orderController");

const { protect, adminOnly } = require("../middleware/authMiddleware");

// POST /order              → Place a new order (logged-in users only)
router.post("/order", protect, placeOrder);

// GET  /orders/:userId     → Get all orders for a specific user
router.get("/orders/:userId", protect, getUserOrders);

// GET  /order/:id          → Track a single order by ID
router.get("/order/:id", protect, trackOrder);

// GET  /admin/orders       → View ALL orders (admin only) [BONUS]
router.get("/admin/orders", protect, adminOnly, getAllOrders);

module.exports = router;
