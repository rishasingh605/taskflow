// models/Task.js
// Defines the structure of a Task document in MongoDB.

const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
  {
    // Task title (e.g. "Design homepage mockup")
    title: {
      type:     String,
      required: [true, 'Task title is required'],
      trim:     true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },

    // Detailed description of what the task involves
    description: {
      type:    String,
      trim:    true,
      default: '',
    },

    // Current status of the task
    status: {
      type:    String,
      enum:    ['todo', 'inprogress', 'in_progress', 'done'], // Allowed values
      default: 'todo',
    },

    // Priority level of the task
    priority: {
      type:    String,
      enum:    ['low', 'medium', 'high'],
      default: 'medium',
    },

    // When the task is due
    dueDate: {
      type: Date,
    },

    // Which project this task belongs to (optional)
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref:  'Project', // References the Project collection
    },

    // Which user is assigned to complete this task
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref:  'User', // References the User collection
    },

    // Who created this task
    createdBy: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'User',
      required: true,
    },

    // File path for the attached file (e.g. "uploads/report.pdf")
    // Stored after Multer saves the uploaded file
    attachment: {
      type:    String,
      default: null,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt automatically
  }
);

module.exports = mongoose.model('Task', taskSchema);
