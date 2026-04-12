// server.js
// ──────────────────────────────────────────────
// Entry point for the Drone Food Delivery backend.
// Bootstraps Express, connects to MongoDB, and
// registers all routes and middleware.
// ──────────────────────────────────────────────

require("dotenv").config(); // Load .env variables first

const express = require("express");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const orderRoutes = require("./routes/orderRoutes");
const { errorHandler, notFound } = require("./middleware/errorHandler");
const cors = require('cors');
// ── Connect to MongoDB ──
connectDB();

const app = express();

// ──────────────────────────────────────────────
// Global Middleware
// ──────────────────────────────────────────────

// Parse incoming JSON bodies
app.use(express.json());

// Parse URL-encoded bodies (for form submissions)
app.use(express.urlencoded({ extended: false }));

// Basic CORS headers — replace with the `cors` package for production
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
  if (req.method === "OPTIONS") return res.sendStatus(200);
  next();
});

// ──────────────────────────────────────────────
// Health Check
// ──────────────────────────────────────────────
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "🚁 Drone Food Delivery API is running",
    version: "1.0.0",
    endpoints: {
      auth: ["POST /signup", "POST /login"],
      orders: [
        "POST /order",
        "GET  /orders/:userId",
        "GET  /order/:id",
        "GET  /admin/orders  (admin only)",
      ],
    },
  });
});

// ──────────────────────────────────────────────
// Route Registration
// ──────────────────────────────────────────────
app.use("/", authRoutes);    // /signup, /login
app.use("/", orderRoutes);   // /order, /orders/:userId, /admin/orders

// ──────────────────────────────────────────────
// Error Handling (must be last)
// ──────────────────────────────────────────────
app.use(notFound);       // 404 for unknown routes
app.use(errorHandler);   // Global error handler

// ──────────────────────────────────────────────
// Start Server
// ──────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📋 Environment: ${process.env.NODE_ENV || "development"}`);
});

app.use(cors({
  origin: 'http://localhost:3000', // Your frontend URL
  credentials: true,
}));