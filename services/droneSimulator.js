// services/droneSimulator.js
// ──────────────────────────────────────────────
// Simulates a drone delivery lifecycle using setTimeout.
// Timeline:
//   0s   → Order placed (status: Preparing)
//  15s   → Drone dispatched (status: Dispatched)
//  45s   → Delivery complete (status: Delivered)
//
// Adjust the delays below to suit your demo needs.
// ──────────────────────────────────────────────

const Order = require("../models/Order");

// Delay constants (in milliseconds)
const DISPATCH_DELAY = 15_000;   // 15 seconds  → Preparing  → Dispatched
const DELIVER_DELAY  = 45_000;   // 45 seconds  → Dispatched → Delivered

// ── Drone ID generator: e.g. "DRONE-A3F7" ──
const generateDroneId = () => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const rand = Array.from({ length: 4 }, () =>
    chars[Math.floor(Math.random() * chars.length)]
  ).join("");
  return `DRONE-${rand}`;
};

// ──────────────────────────────────────────────
// simulateDroneDelivery(orderId)
// Kicks off the automated status progression for a given order.
// ──────────────────────────────────────────────
const simulateDroneDelivery = (orderId) => {
  // ── Step 1: Preparing → Dispatched (after DISPATCH_DELAY) ──
  setTimeout(async () => {
    try {
      await Order.findByIdAndUpdate(orderId, {
        status: "Dispatched",
        "statusTimestamps.dispatched": new Date(),
      });
      console.log(`🚁 [Drone] Order ${orderId} — status: Dispatched`);
    } catch (err) {
      console.error(`❌ [Drone] Failed to update to Dispatched: ${err.message}`);
    }
  }, DISPATCH_DELAY);

  // ── Step 2: Dispatched → Delivered (after DELIVER_DELAY) ──
  setTimeout(async () => {
    try {
      await Order.findByIdAndUpdate(orderId, {
        status: "Delivered",
        "statusTimestamps.delivered": new Date(),
      });
      console.log(`✅ [Drone] Order ${orderId} — status: Delivered`);
    } catch (err) {
      console.error(`❌ [Drone] Failed to update to Delivered: ${err.message}`);
    }
  }, DELIVER_DELAY);
};

module.exports = { simulateDroneDelivery, generateDroneId };
