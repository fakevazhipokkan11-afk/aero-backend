// models/Order.js
// ──────────────────────────────────────────────
// Mongoose schema for food delivery orders.
// Tracks order lifecycle: Preparing → Dispatched → Delivered
// ──────────────────────────────────────────────

const mongoose = require("mongoose");

// ── Sub-schema: food item details ──
const foodItemSchema = new mongoose.Schema({
  name: { type: String, required: true },       // e.g. "Margherita Pizza"
  quantity: { type: Number, required: true, min: 1 },
  price: { type: Number, required: true },       // price per unit in ₹ / $
});

// ── Sub-schema: delivery location ──
const locationSchema = new mongoose.Schema({
  address: { type: String, required: true },
  city: { type: String, required: true },
  pincode: { type: String, required: true },
  // Optionally store lat/lng for real drone navigation
  lat: { type: Number },
  lng: { type: Number },
});

const orderSchema = new mongoose.Schema(
  {
    // Reference to the user who placed this order
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Food items in this order (supports multiple items)
    foodItems: {
      type: [foodItemSchema],
      required: true,
      validate: [(arr) => arr.length > 0, "Order must have at least one food item"],
    },

    // Delivery destination
    deliveryLocation: {
      type: locationSchema,
      required: true,
    },

    // Simulated drone assigned to this order
    droneId: {
      type: String,
      default: null,
    },

    // Order lifecycle status
    status: {
      type: String,
      enum: ["Preparing", "Dispatched", "Delivered"],
      default: "Preparing",
    },

    // Timestamps for each status transition (useful for frontend tracking)
    statusTimestamps: {
      preparing: { type: Date, default: Date.now },
      dispatched: { type: Date, default: null },
      delivered: { type: Date, default: null },
    },

    // Computed total cost of the order
    totalAmount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true } // adds createdAt and updatedAt
);

// ── Pre-save hook: auto-calculate total amount ──
orderSchema.pre("save", function (next) {
  if (this.foodItems && this.foodItems.length > 0) {
    this.totalAmount = this.foodItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
  }
  next();
});

module.exports = mongoose.model("Order", orderSchema);
