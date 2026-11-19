// controllers/taskController.js
// Handles all CRUD operations for Tasks, including file attachment.

const mongoose = require('mongoose');
const Task     = require('../models/Task');
const path     = require('path');

// ─── @desc    Get all tasks
// ─── @route   GET /api/tasks
// ─── @access  Protected
const getTasks = async (req, res) => {
  try {
    const filter = {};

    if (req.user && req.user.role !== 'admin') {
      filter.$or = [{ createdBy: req.user._id }, { assignedTo: req.user._id }];
    }

    // Optional query filters
    if (req.query.status)   filter.status   = req.query.status;
    if (req.query.priority) filter.priority = req.query.priority;
    if (req.query.project && mongoose.Types.ObjectId.isValid(req.query.project)) {
      filter.project = req.query.project;
    }

    const tasks = await Task.find(filter)
      .populate('project',    'name color icon')
      .populate('assignedTo', 'name email')
      .populate('createdBy',  'name email')
      .sort({ createdAt: -1 });

    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── @desc    Get a single task by ID
// ─── @route   GET /api/tasks/:id
// ─── @access  Protected
const getTaskById = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ message: 'Task not found.' });
    }

    const task = await Task.findById(req.params.id)
      .populate('project',    'name color icon')
      .populate('assignedTo', 'name email')
      .populate('createdBy',  'name email');

    if (!task) {
      return res.status(404).json({ message: 'Task not found.' });
    }

    res.status(200).json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── @desc    Create a new task (with optional file upload)
// ─── @route   POST /api/tasks
// ─── @access  Protected
const createTask = async (req, res) => {
  try {
    const { title, description, status, priority, dueDate } = req.body;

    if (!title) {
      return res.status(400).json({ message: 'Task title is required.' });
    }

    const projectId = req.body.project || req.body.projectId || null;
    const assigneeId = req.body.assignedTo || req.body.assigneeId || null;

    const attachment = req.file ? req.file.filename : null;

    const validProject = (projectId && mongoose.Types.ObjectId.isValid(projectId)) ? projectId : null;
    const validAssignee = (assigneeId && mongoose.Types.ObjectId.isValid(assigneeId)) ? assigneeId : null;

    const task = await Task.create({
      title,
      description: description || '',
      status: status || 'todo',
      priority: priority || 'medium',
      dueDate: dueDate || undefined,
      project: validProject,
      assignedTo: validAssignee,
      createdBy: req.user?._id || new mongoose.Types.ObjectId(),
      attachment,
    });

    const populated = await Task.findById(task._id)
      .populate('project', 'name color icon')
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email');

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── @desc    Update a task (with optional new file upload)
// ─── @route   PUT /api/tasks/:id
// ─── @access  Protected
const updateTask = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(200).json({ ...req.body, _id: req.params.id });
    }

    if (req.file) {
      req.body.attachment = req.file.filename;
    }

    if ('projectId' in req.body || 'project' in req.body) {
      const pid = req.body.project || req.body.projectId;
      req.body.project = (pid && mongoose.Types.ObjectId.isValid(pid)) ? pid : null;
    }

    if ('assigneeId' in req.body || 'assignedTo' in req.body) {
      const aid = req.body.assignedTo || req.body.assigneeId;
      req.body.assignedTo = (aid && mongoose.Types.ObjectId.isValid(aid)) ? aid : null;
    }

    const updated = await Task.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
      .populate('project', 'name color icon')
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email');

    if (!updated) {
      return res.status(404).json({ message: 'Task not found.' });
    }

    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── @desc    Delete a task
// ─── @route   DELETE /api/tasks/:id
// ─── @access  Protected
const deleteTask = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(200).json({ message: 'Task deleted successfully.' });
    }

    const task = await Task.findById(req.params.id);
    if (task) {
      await task.deleteOne();
    }

    res.status(200).json({ message: 'Task deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getTasks, getTaskById, createTask, updateTask, deleteTask };
