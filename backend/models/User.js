// models/User.js
// Defines the structure of a User document in MongoDB.

const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    // User's full name
    name: {
      type:     String,
      required: [true, 'Name is required'],
      trim:     true,
    },

    // Email must be unique — used for login
    email: {
      type:     String,
      required: [true, 'Email is required'],
      unique:   true,
      lowercase: true,
      trim:     true,
    },

    // Password is stored as a bcrypt hash — never plain text
    password: {
      type:     String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select:   false, // Never return password in query results by default
    },

    // Role controls what the user can access
    role: {
      type:    String,
      enum:    ['admin', 'member'], // Only these two values are allowed
      default: 'member',
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);

// ─── Pre-save Hook ─────────────────────────────────────────────────────────────
// This runs automatically BEFORE saving a user to the database.
// It hashes the password if it was changed (or is new).
userSchema.pre('save', async function (next) {
  // Only hash if password was modified (not on other updates like name)
  if (!this.isModified('password')) return next();

  // Generate a salt (random data) and hash the password with it
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// ─── Instance Method ───────────────────────────────────────────────────────────
// comparePassword() lets us check a plain-text password against the stored hash.
// Used in the login controller.
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Export the model so we can use it in controllers
module.exports = mongoose.model('User', userSchema);
