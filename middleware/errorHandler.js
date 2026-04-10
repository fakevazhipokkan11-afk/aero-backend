// middleware/errorHandler.js
// ──────────────────────────────────────────────
// Global error handler — catches anything that
// falls through without a response.
// Must be registered LAST in server.js (after all routes).
// ──────────────────────────────────────────────

const errorHandler = (err, req, res, next) => {
  // Use the error's status code if set, otherwise default to 500
  const statusCode = err.statusCode || res.statusCode === 200 ? 500 : res.statusCode;

  console.error(`[ERROR] ${req.method} ${req.url} → ${err.message}`);

  res.status(statusCode).json({
    success: false,
    message: err.message || "Internal Server Error",
    // Only include stack trace in development
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

// ── 404 handler: catches requests to unknown routes ──
const notFound = (req, res, next) => {
  const error = new Error(`Route not found: ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};

module.exports = { errorHandler, notFound };
