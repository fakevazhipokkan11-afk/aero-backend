// controllers/orderController.js
// ──────────────────────────────────────────────
// Handles all order-related operations:
//   • Place a new order
//   • Get all orders for a user
//   • Track a single order
//   • Admin: view all orders
// ──────────────────────────────────────────────

const Order = require("../models/Order");
const { simulateDroneDelivery, generateDroneId } = require("../services/droneSimulator");

// ──────────────────────────────────────────────
// POST /order
// Places a new food delivery order.
// Requires authentication (protect middleware).
// ──────────────────────────────────────────────
const placeOrder = async (req, res) => {
  const { foodItems, deliveryLocation } = req.body;

  // Validate required fields
  if (!foodItems || !Array.isArray(foodItems) || foodItems.length === 0) {
    return res.status(400).json({ success: false, message: "foodItems array is required and must not be empty" });
  }
  if (!deliveryLocation || !deliveryLocation.address || !deliveryLocation.city || !deliveryLocation.pincode) {
    return res.status(400).json({ success: false, message: "deliveryLocation with address, city, and pincode is required" });
  }

  try {
    // Assign a simulated drone to this order
    const droneId = generateDroneId();

    // Create the order in the database
    const order = await Order.create({
      userId: req.user._id,   // Injected by protect middleware
      foodItems,
      deliveryLocation,
      droneId,
      status: "Preparing",
      statusTimestamps: { preparing: new Date() },
    });

    console.log(`📦 New order ${order._id} placed. Assigned drone: ${droneId}`);

    // Kick off the async drone simulation (non-blocking)
    simulateDroneDelivery(order._id);

    res.status(201).json({
      success: true,
      message: "Order placed successfully! Your drone is being prepared.",
      data: order,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: messages.join(", ") });
    }
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// ──────────────────────────────────────────────
// GET /orders/:userId
// Returns all orders placed by a specific user.
// A user can only view their own orders (enforced below).
// ──────────────────────────────────────────────
const getUserOrders = async (req, res) => {
  const { userId } = req.params;

  // Prevent users from fetching another user's orders
  // (Admins bypass this check via the admin route)
  if (req.user._id.toString() !== userId && req.user.role !== "admin") {
    return res.status(403).json({ success: false, message: "Access denied — you can only view your own orders" });
  }

  try {
    const orders = await Order.find({ userId })
      .sort({ createdAt: -1 }) // newest first
      .populate("userId", "name email"); // include user info

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// ──────────────────────────────────────────────
// GET /order/:id
// Tracks a single order by its MongoDB ID.
// ──────────────────────────────────────────────
const trackOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate("userId", "name email");

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    // Ensure user owns the order (or is an admin)
    if (order.userId._id.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Access denied — not your order" });
    }

    res.status(200).json({ success: true, data: order });
  } catch (error) {
    // Handle invalid MongoDB ObjectId
    if (error.kind === "ObjectId") {
      return res.status(400).json({ success: false, message: "Invalid order ID format" });
    }
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// ──────────────────────────────────────────────
// GET /admin/orders  [BONUS]
// Admin-only: returns ALL orders across all users.
// ──────────────────────────────────────────────
const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .sort({ createdAt: -1 })
      .populate("userId", "name email");

    // Build a quick summary for the admin dashboard
    const summary = {
      total: orders.length,
      preparing: orders.filter((o) => o.status === "Preparing").length,
      dispatched: orders.filter((o) => o.status === "Dispatched").length,
      delivered: orders.filter((o) => o.status === "Delivered").length,
    };

    res.status(200).json({
      success: true,
      summary,
      data: orders,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

module.exports = { placeOrder, getUserOrders, trackOrder, getAllOrders };
