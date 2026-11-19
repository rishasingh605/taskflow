// middleware/errorMiddleware.js
// Two middleware functions for consistent error handling across the entire API.
// These must be registered AFTER all routes in server.js.

// ─── notFound ─────────────────────────────────────────────────────────────────
// Catches requests to routes that don't exist.
// Creates a 404 error and passes it to the next error handler.
const notFound = (req, res, next) => {
  const error = new Error(`Route not found: ${req.originalUrl}`);
  res.status(404);
  next(error); // Pass error to errorHandler below
};

// ─── errorHandler ─────────────────────────────────────────────────────────────
// Catches ALL errors thrown anywhere in the app (controllers, middleware, etc.)
// Returns a consistent JSON error response every time.
// Must have 4 parameters — Express knows it's an error handler because of (err, req, res, next)
const errorHandler = (err, req, res, next) => {
  // Sometimes Express passes a 200 even for errors — default to 500
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

  // Handle Multer-specific errors (e.g. file too large, wrong type)
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ message: 'File is too large. Maximum allowed size is 5 MB.' });
  }

  // Handle Mongoose CastError (invalid MongoDB ObjectId in URL params)
  if (err.name === 'CastError') {
    return res.status(400).json({ message: `Invalid ID: ${err.value}` });
  }

  // Handle Mongoose ValidationError (schema validation failed)
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({ message: messages.join(', ') });
  }

  // Handle Mongoose Duplicate Key error (e.g. duplicate email)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(400).json({ message: `${field} already exists.` });
  }

  // Generic error response
  res.status(statusCode).json({
    message: err.message || 'Internal Server Error',
    // Only show the stack trace in development mode, not in production
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
};

module.exports = { notFound, errorHandler };
