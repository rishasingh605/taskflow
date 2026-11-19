// routes/taskRoutes.js
// Maps URLs to task controller functions.
// POST and PUT routes also run the upload middleware for file attachment.

const express = require('express');
const router  = express.Router();

const {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
} = require('../controllers/taskController');

const { protect }         = require('../middleware/authMiddleware');
const { upload }          = require('../middleware/uploadMiddleware');

// Middleware supporting either 'attachment' or 'file' form field
const handleUpload = (req, res, next) => {
  upload.fields([{ name: 'attachment', maxCount: 1 }, { name: 'file', maxCount: 1 }])(req, res, (err) => {
    if (err) return next(err);
    if (req.files) {
      if (req.files['attachment']?.[0]) req.file = req.files['attachment'][0];
      else if (req.files['file']?.[0]) req.file = req.files['file'][0];
    }
    next();
  });
};

// Apply protect to ALL task routes
router.use(protect);

// GET  /api/tasks   → get all tasks (with optional query filters)
// POST /api/tasks   → create task
router.route('/')
  .get(getTasks)
  .post(handleUpload, createTask);

// GET    /api/tasks/:id  → get one task
// PUT    /api/tasks/:id  → update task (with optional new file)
// DELETE /api/tasks/:id  → delete task
router.route('/:id')
  .get(getTaskById)
  .put(handleUpload, updateTask)
  .delete(deleteTask);

module.exports = router;

