// middleware/authMiddleware.js
// ──────────────────────────────────────────────
// JWT verification middleware.
// Attach this to any route that requires a logged-in user.
// ──────────────────────────────────────────────

const jwt = require("jsonwebtoken");
const User = require("../models/User");

// ── Protect: verify JWT and attach user to request ──
const protect = async (req, res, next) => {
  let token;

  // JWT is expected in the Authorization header as: "Bearer <token>"
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({ success: false, message: "Not authorised — no token provided" });
  }

  try {
    // Verify and decode the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch the user (excluding password) and attach to request
    req.user = await User.findById(decoded.id).select("-password");

    if (!req.user) {
      return res.status(401).json({ success: false, message: "User not found" });
    }

    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: "Invalid or expired token" });
  }
};

// ── AdminOnly: restrict route to admin users ──
const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    return next();
  }
  return res.status(403).json({ success: false, message: "Access denied — admins only" });
};

module.exports = { protect, adminOnly };
