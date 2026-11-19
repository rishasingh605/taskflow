// controllers/projectController.js
// Handles all CRUD operations for Projects.

const mongoose = require('mongoose');
const Project  = require('../models/Project');
const Task     = require('../models/Task');

// ─── @desc    Get all projects
// ─── @route   GET /api/projects
// ─── @access  Protected
const getProjects = async (req, res) => {
  try {
    const projects = await Project.find({})
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json(projects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── @desc    Get a single project by ID
// ─── @route   GET /api/projects/:id
// ─── @access  Protected
const getProjectById = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ message: 'Project not found.' });
    }
    const project = await Project.findById(req.params.id)
      .populate('createdBy', 'name email');

    if (!project) {
      return res.status(404).json({ message: 'Project not found.' });
    }

    res.status(200).json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── @desc    Create a new project
// ─── @route   POST /api/projects
// ─── @access  Protected
const createProject = async (req, res) => {
  try {
    const { name, description, color, icon } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Project name is required.' });
    }

    const project = await Project.create({
      name,
      description: description || '',
      color: color || '#6c63ff',
      icon: icon || '📁',
      createdBy: req.user?._id || new mongoose.Types.ObjectId(),
    });

    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── @desc    Update a project
// ─── @route   PUT /api/projects/:id
// ─── @access  Protected
const updateProject = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(200).json({ ...req.body, _id: req.params.id });
    }

    const updated = await Project.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({ message: 'Project not found.' });
    }

    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── @desc    Delete a project
// ─── @route   DELETE /api/projects/:id
// ─── @access  Protected
const deleteProject = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(200).json({ message: 'Project deleted successfully.' });
    }

    const project = await Project.findById(req.params.id);

    if (project) {
      // Also cleanup associated tasks for this project
      await Task.deleteMany({ project: project._id });
      await project.deleteOne();
    }

    res.status(200).json({ message: 'Project deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getProjects, getProjectById, createProject, updateProject, deleteProject };
