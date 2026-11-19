// middleware/authMiddleware.js
// This middleware protects routes — only logged-in users can access them.
// It reads the JWT token from the request header, verifies it,
// and attaches the logged-in user's info to req.user.

const jwt  = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  // 1. Check if the Authorization header exists and starts with "Bearer"
  // Header format: Authorization: Bearer <token>
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // 2. Extract the token part (after "Bearer ")
      token = req.headers.authorization.split(' ')[1];

      // 3. Verify the token using our JWT_SECRET from .env
      // If the token is fake or expired, jwt.verify() will throw an error
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // 4. Find the user from the database using the id stored in the token
      // We use .select('-password') to NOT return the password field
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return res.status(401).json({ message: 'User not found.' });
      }

      // 5. Call next() to pass control to the actual route handler
      next();
    } catch (error) {
      // Token is invalid or expired
      return res.status(401).json({ message: 'Not authorized, invalid token.' });
    }
  }

  // If no token was provided at all
  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token provided.' });
  }
};

// ─── Admin-only Middleware ─────────────────────────────────────────────────────
// Use this AFTER protect() to restrict a route to admin users only.
const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next(); // User is admin — allow through
  } else {
    res.status(403).json({ message: 'Access denied. Admins only.' });
  }
};

module.exports = { protect, adminOnly };
