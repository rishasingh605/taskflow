// routes/projectRoutes.js
// Maps URLs to project controller functions.
// All routes are protected with JWT middleware.

const express = require('express');
const router  = express.Router();

const {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
} = require('../controllers/projectController');

const { protect } = require('../middleware/authMiddleware');

// Apply protect middleware to ALL routes in this file
// This means every request to /api/projects/* must have a valid token
router.use(protect);

// GET  /api/projects      → get all projects
// POST /api/projects      → create a new project
router.route('/')
  .get(getProjects)
  .post(createProject);

// GET    /api/projects/:id  → get one project
// PUT    /api/projects/:id  → update a project
// DELETE /api/projects/:id  → delete a project
router.route('/:id')
  .get(getProjectById)
  .put(updateProject)
  .delete(deleteProject);

module.exports = router;
