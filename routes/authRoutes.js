// routes/authRoutes.js
// ──────────────────────────────────────────────
// Authentication routes (public — no JWT required)
// ──────────────────────────────────────────────

const express = require("express");
const router = express.Router();
const { signup, login } = require("../controllers/authController");

// POST /signup  → Register a new user
router.post("/signup", signup);

// POST /login   → Authenticate and receive JWT
router.post("/login", login);

module.exports = router;
