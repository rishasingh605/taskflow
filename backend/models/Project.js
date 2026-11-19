// models/Project.js
// Defines the structure of a Project document in MongoDB.

const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema(
  {
    // Project name (e.g. "Website Redesign")
    name: {
      type:     String,
      required: [true, 'Project name is required'],
      trim:     true,
    },

    // Short description of what the project is about
    description: {
      type:    String,
      trim:    true,
      default: '',
    },

    // Color used in the UI (stored as hex string, e.g. "#6c63ff")
    color: {
      type:    String,
      default: '#6c63ff',
    },

    // Emoji icon used in the UI (e.g. "🎨")
    icon: {
      type:    String,
      default: '📁',
    },

    // Reference to the User who created this project
    // 'ref: User' tells Mongoose which collection to join with .populate()
    createdBy: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'User',
      required: true,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt automatically
  }
);

module.exports = mongoose.model('Project', projectSchema);
