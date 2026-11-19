# Academic Project Report — Continuous Assessment 3 (CA3)
**Course Outcome (CO):** CO3 | **Bloom's Taxonomy Level:** L3 (Apply) | **Maximum Marks:** 50 (25 Execution + 25 Viva)

---

# Front Page

| Field | Details |
|---|---|
| **Project Title** | **TaskFlow — Full-Stack Task & Project Management System** |
| **Course Component** | CA3 Project Implementation & Viva |
| **Technology Stack** | Node.js, Express.js, MongoDB (Mongoose), JWT, Multer, React (Vite) |
| **Evaluation Criteria** | 1. Routing (5 Marks)<br>2. Middleware (5 Marks)<br>3. Controller (5 Marks)<br>4. REST API (5 Marks)<br>5. File Upload (5 Marks) |
| **Date of Submission** | November 2026 |

---

## 1. Introduction

### 1.1 Project Overview
**TaskFlow** is an enterprise-grade task and workflow management system designed for teams and individuals to organize projects, prioritize tasks, track deadlines, attach critical project documentation (PDFs, images, posters), and view visual project analytics.

### 1.2 Core Capabilities
1. **User Management:** Secure user registration and login with bcrypt password hashing and JSON Web Tokens (JWT) for authentication and data isolation.
2. **Project Management:** Project creation with custom color coding and icon identifiers, description tracking, and deletion.
3. **Task Management (Core):** Task creation with title, description, priority (low, medium, high), due dates, project association, and assignee mapping. Real-time status toggling across `Todo`, `In Progress`, and `Done`.
4. **File Attachment System:** Integrated file attachment using Multer, allowing users to upload and download PDFs, design mockups, and images directly linked to each task.
5. **Visual Progress Dashboard:** Interactive dashboard showing total, in-progress, completed, and overdue tasks, alongside completion percentages per project.
6. **Search & Multi-Facet Filtering:** Filter tasks by status, priority level, project association, or keyword search.
7. **Role-Based Admin Control:** Admin users can view and manage all users and tasks platform-wide; standard members are scoped strictly to their own tasks.

---

## 2. System Architecture & Design

### 2.1 Backend Directory Architecture (`/backend`)
```
backend/
├── config/
│   └── db.js                 # MongoDB connection using Mongoose
├── controllers/
│   ├── authController.js     # User registration, login, profile & admin user management
│   ├── projectController.js  # Project CRUD logic
│   └── taskController.js     # Task CRUD logic & file attachment association
├── middleware/
│   ├── authMiddleware.js     # JWT token verification (protect) & Role check (adminOnly)
│   ├── errorMiddleware.js    # 404 Not Found & centralized JSON error handler
│   └── uploadMiddleware.js   # Multer disk storage and file extension/MIME validator
├── models/
│   ├── User.js               # User schema with pre-save bcrypt hash & comparePassword method
│   ├── Project.js            # Project schema with user reference
│   └── Task.js               # Task schema with priority, status, file attachment, and project ref
├── routes/
│   ├── authRoutes.js         # /api/auth routes
│   ├── projectRoutes.js      # /api/projects routes
│   └── taskRoutes.js         # /api/tasks routes
├── uploads/                  # Storage directory for uploaded user attachments
├── .env                      # Environment configuration (PORT, MONGO_URI, JWT_SECRET)
└── server.js                 # Express server entry point
```

---

## 3. Detailed CA3 Concept Implementation

### 3.1 Routing (5 Marks)
The application utilizes modular Express routers (`express.Router()`) to cleanly separate URL paths by feature:

* **Auth Router (`/api/auth`):**
  - `POST /register` — User signup
  - `POST /login` — User authentication and JWT issue
  - `GET /me` — Current user profile (Protected)
  - `GET /users` — Admin view all users (Admin Only)
  - `DELETE /users/:id` — Admin delete user (Admin Only)
* **Project Router (`/api/projects`):**
  - `GET /` — List user's projects (or all for admin)
  - `POST /` — Create a new project
  - `GET /:id` — Get single project details
  - `PUT /:id` — Update project
  - `DELETE /:id` — Remove project
* **Task Router (`/api/tasks`):**
  - `GET /` — List tasks with query filter support (`?status=...&priority=...&project=...`)
  - `POST /` — Create task with file attachment
  - `GET /:id` — Get task details
  - `PUT /:id` — Update task and/or replace file attachment
  - `DELETE /:id` — Remove task

```javascript
// routes/taskRoutes.js
const express = require('express');
const router  = express.Router();
const { getTasks, getTaskById, createTask, updateTask, deleteTask } = require('../controllers/taskController');
const { protect } = require('../middleware/authMiddleware');
const { upload }  = require('../middleware/uploadMiddleware');

router.use(protect); // Apply JWT protection to all routes

router.route('/')
  .get(getTasks)
  .post(upload.single('attachment'), createTask);

router.route('/:id')
  .get(getTaskById)
  .put(upload.single('attachment'), updateTask)
  .delete(deleteTask);

module.exports = router;
```

---

### 3.2 Middleware (5 Marks)
The system incorporates three core custom middleware components:

1. **Authentication Middleware (`authMiddleware.js`):**
   - Intercepts requests, extracts the Bearer token from the `Authorization` header, verifies the JWT using `jwt.verify()`, and attaches the authenticated user document to `req.user`.
   - `adminOnly` sub-middleware validates that `req.user.role === 'admin'`.

2. **File Upload Middleware (`uploadMiddleware.js`):**
   - Utilizes Multer `diskStorage` to persist attachments with sanitized, collision-free filenames (`${baseName}-${Date.now()}${ext}`).
   - Implements a strict `fileFilter` validating both MIME type and file extension (allowing only JPEG, PNG, and PDF). Enforces a 5MB size limit.

3. **Error Handling Middleware (`errorMiddleware.js`):**
   - `notFound`: Catches unmatched endpoints and passes a structured 404 error to next.
   - `errorHandler`: Global catch-all handler that standardizes responses into a clean `{ message, stack }` JSON format with appropriate HTTP status codes (400, 401, 403, 404, 500).

```javascript
// middleware/authMiddleware.js
const jwt  = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
      if (!req.user) return res.status(401).json({ message: 'User not found.' });
      return next();
    } catch (error) {
      return res.status(401).json({ message: 'Not authorized, invalid token.' });
    }
  }
  if (!token) return res.status(401).json({ message: 'Not authorized, no token.' });
};

const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') next();
  else res.status(403).json({ message: 'Access denied. Admins only.' });
};

module.exports = { protect, adminOnly };
```

---

### 3.3 Controllers (5 Marks)
Controllers cleanly encapsulate business logic, decoupling request handling from routing:
- **`authController.js`**: Validates credentials, manages password hashing via Mongoose hooks, signs JWTs, and handles user CRUD.
- **`projectController.js`**: Enforces user ownership rules (regular users only mutate their own projects; admins have global privileges).
- **`taskController.js`**: Orchestrates task creation, Multer file path assignment, database population (`.populate('project')`, `.populate('assignedTo')`), and status transitions.

```javascript
// controllers/taskController.js (Excerpt)
const createTask = async (req, res) => {
  try {
    const { title, description, status, priority, dueDate } = req.body;
    if (!title) return res.status(400).json({ message: 'Task title is required.' });

    const attachment = req.file ? req.file.filename : null;
    const task = await Task.create({
      title,
      description: description || '',
      status: status || 'todo',
      priority: priority || 'medium',
      dueDate: dueDate || undefined,
      project: req.body.project || req.body.projectId || null,
      assignedTo: req.body.assignedTo || req.body.assigneeId || null,
      createdBy: req.user._id,
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
```

---

### 3.4 REST API (5 Marks)
Standard HTTP verbs (`GET`, `POST`, `PUT`, `DELETE`) with appropriate status codes (`200 OK`, `201 Created`, `400 Bad Request`, `401 Unauthorized`, `403 Forbidden`, `404 Not Found`, `500 Internal Error`):

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register new user | No |
| `POST` | `/api/auth/login` | Authenticate user & return JWT | No |
| `GET` | `/api/auth/me` | Fetch active user profile | Yes (Bearer JWT) |
| `GET` | `/api/auth/users` | List all users (Admin panel) | Yes (Admin) |
| `DELETE` | `/api/auth/users/:id` | Delete user account | Yes (Admin) |
| `GET` | `/api/projects` | Fetch all accessible projects | Yes (Bearer JWT) |
| `POST` | `/api/projects` | Create a new project | Yes (Bearer JWT) |
| `PUT` | `/api/projects/:id` | Update project details | Yes (Bearer JWT) |
| `DELETE` | `/api/projects/:id` | Delete project | Yes (Bearer JWT) |
| `GET` | `/api/tasks` | Fetch tasks (supports query filtering) | Yes (Bearer JWT) |
| `POST` | `/api/tasks` | Create task with optional file attachment | Yes (Multipart) |
| `GET` | `/api/tasks/:id` | Fetch task details by ID | Yes (Bearer JWT) |
| `PUT` | `/api/tasks/:id` | Update task & replace attachment | Yes (Multipart) |
| `DELETE` | `/api/tasks/:id` | Delete task | Yes (Bearer JWT) |

---

### 3.5 File Upload (5 Marks)
Files are uploaded using `multipart/form-data` with Multer:
1. When a user creates or edits a task and attaches a poster, image, or document, the browser submits a `FormData` object.
2. The Multer middleware validates that the file is below 5 MB and is a valid type (`.pdf`, `.png`, `.jpg`, `.jpeg`).
3. The file is saved to `/uploads` with a unique timestamped name.
4. The filename is stored in MongoDB inside the Task document under the `attachment` field.
5. Uploaded files are served statically via `GET http://localhost:5001/uploads/:filename`, enabling 1-click download in the UI.

```javascript
// middleware/uploadMiddleware.js
const multer = require('multer');
const path   = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const baseName = path.basename(file.originalname, ext).replace(/\s+/g, '-');
    cb(null, `${baseName}-${Date.now()}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|pdf/;
  const mimeOk = allowed.test(file.mimetype);
  const extOk  = allowed.test(path.extname(file.originalname).toLowerCase());
  if (mimeOk && extOk) cb(null, true);
  else cb(new Error('Only JPG, PNG, and PDF files are allowed.'), false);
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });
module.exports = { upload };
```

---

## 4. How to Run the Application

### 4.1 Running the Backend Server
```bash
cd backend
npm install
node server.js
# Backend starts at: http://localhost:5001
```

### 4.2 Running the Frontend Client
```bash
cd frontend
npm install
npm run dev
# Frontend starts at: http://localhost:5173
```

### 4.3 Default Demo Credentials
- **Admin User:** `admin@taskflow.dev` / `password123` (Full platform administration)
- **Regular Member:** `risha@taskflow.dev` / `password123` (Personal tasks and projects)
