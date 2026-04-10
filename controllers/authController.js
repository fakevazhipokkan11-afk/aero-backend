// controllers/authController.js
// ──────────────────────────────────────────────
// Handles user registration and login.
// Issues a signed JWT on success.
// ──────────────────────────────────────────────

const jwt = require("jsonwebtoken");
const User = require("../models/User");

// ── Helper: generate a signed JWT for a user ID ──
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
};

// ──────────────────────────────────────────────
// POST /signup
// Creates a new user account
// ──────────────────────────────────────────────
const signup = async (req, res) => {
  const { name, email, password } = req.body;

  // Basic field validation
  if (!name || !email || !password) {
    return res.status(400).json({ success: false, message: "Please provide name, email, and password" });
  }

  try {
    // Check if email is already registered
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ success: false, message: "Email already in use" });
    }

    // Create the user (password is hashed in pre-save hook)
    const user = await User.create({ name, email, password });

    res.status(201).json({
      success: true,
      message: "Account created successfully",
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      },
    });
  } catch (error) {
    // Handle Mongoose validation errors cleanly
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: messages.join(", ") });
    }
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// ──────────────────────────────────────────────
// POST /login
// Authenticates a user and returns JWT
// ──────────────────────────────────────────────
const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: "Please provide email and password" });
  }

  try {
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    // Compare entered password with stored hash
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

module.exports = { signup, login };
