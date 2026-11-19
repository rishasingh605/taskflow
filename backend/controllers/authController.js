// controllers/authController.js
// Handles Register and Login logic.
// Controllers receive req, process data, talk to the database, and send res.

const jwt  = require('jsonwebtoken');
const User = require('../models/User');

// ─── Helper: Generate JWT Token ───────────────────────────────────────────────
// Creates a signed JWT token containing the user's MongoDB _id.
// The token expires after JWT_EXPIRES_IN (from .env, e.g. "7d").
const generateToken = (id) => {
  return jwt.sign(
    { id },                          // Payload — data stored inside the token
    process.env.JWT_SECRET,          // Secret key to sign the token
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// ─── @desc    Register a new user
// ─── @route   POST /api/auth/register
// ─── @access  Public (no login needed)
const register = async (req, res) => {
  try {
    // 1. Get name, email, password from the request body
    const { name, email, password } = req.body;

    // 2. Basic validation — make sure all fields are provided
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please provide name, email, and password.' });
    }

    // 3. Check if a user with this email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email is already registered.' });
    }

    // 4. Create new user — password is hashed automatically by the pre-save hook in User.js
    const user = await User.create({ name, email, password });

    // 5. Respond with user info + JWT token (201 = Created)
    res.status(201).json({
      _id:   user._id,
      name:  user.name,
      email: user.email,
      role:  user.role,
      token: generateToken(user._id), // Send token so frontend can store it
    });
  } catch (error) {
    // Handle unexpected server errors
    res.status(500).json({ message: error.message });
  }
};

// ─── @desc    Login an existing user
// ─── @route   POST /api/auth/login
// ─── @access  Public
const login = async (req, res) => {
  try {
    // 1. Get email and password from request body
    const { email, password } = req.body;

    // 2. Validate input
    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password.' });
    }

    // 3. Find the user by email
    // We use .select('+password') because password has select:false in the schema
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    // 4. Compare entered password with the hashed password in the database
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    // 5. Respond with user info + JWT token (200 = OK)
    res.status(200).json({
      _id:   user._id,
      name:  user.name,
      email: user.email,
      role:  user.role,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── @desc    Get currently logged-in user's profile
// ─── @route   GET /api/auth/me
// ─── @access  Protected (requires token)
const getMe = async (req, res) => {
  // req.user is set by the protect middleware
  res.status(200).json({
    _id:       req.user._id,
    name:      req.user.name,
    email:     req.user.email,
    role:      req.user.role,
    createdAt: req.user.createdAt,
  });
};

// ─── @desc    Get all users (admin only)
// ─── @route   GET /api/auth/users
// ─── @access  Protected / Admin
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── @desc    Delete user (admin only)
// ─── @route   DELETE /api/auth/users/:id
// ─── @access  Protected / Admin
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    if (user.role === 'admin') {
      return res.status(400).json({ message: 'Cannot delete an admin account.' });
    }
    await user.deleteOne();
    res.status(200).json({ message: 'User deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── @desc    Update currently logged-in user's profile
// ─── @route   PUT /api/auth/profile
// ─── @access  Protected
const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    if (req.body.name) user.name = req.body.name;
    if (req.body.email) user.email = req.body.email;
    if (req.body.password) user.password = req.body.password;

    const updated = await user.save();

    res.status(200).json({
      _id: updated._id,
      name: updated.name,
      email: updated.email,
      role: updated.role,
      createdAt: updated.createdAt,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { register, login, getMe, updateProfile, getAllUsers, deleteUser };


