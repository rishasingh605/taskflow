// routes/authRoutes.js
// Defines the URL paths for authentication.
// Each route is linked to a controller function.

const express = require('express');
const router  = express.Router(); // Create a mini Express app (Router)

// Import controller functions
const { register, login, getMe, updateProfile, getAllUsers, deleteUser } = require('../controllers/authController');

// Import protect and adminOnly middleware
const { protect, adminOnly } = require('../middleware/authMiddleware');

// ─── Public Routes ────────────────────────────────────────────────────────────
// These routes do NOT require a token

// POST /api/auth/register — Create a new user account
router.post('/register', register);

// POST /api/auth/login — Login and get a JWT token
router.post('/login', login);

// ─── Protected Routes ─────────────────────────────────────────────────────────
// These routes require a valid JWT token (protect middleware runs first)

// GET /api/auth/me — Get the currently logged-in user's profile
router.get('/me', protect, getMe);

// PUT /api/auth/profile — Update currently logged-in user's profile
router.put('/profile', protect, updateProfile);

// ─── Admin Routes ─────────────────────────────────────────────────────────────
// GET /api/auth/users — Admin view all registered users
router.get('/users', protect, adminOnly, getAllUsers);

// DELETE /api/auth/users/:id — Admin delete user
router.delete('/users/:id', protect, adminOnly, deleteUser);

module.exports = router;

