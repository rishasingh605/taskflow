const express = require('express');
const cors    = require('cors');
const dotenv  = require('dotenv');
const path    = require('path');

// Load .env variables FIRST before anything else
dotenv.config({ path: path.join(__dirname, '.env') });

const connectDB      = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

// Connect to MongoDB
connectDB();

const app = express();

// ─── Core Middleware ──────────────────────────────────────────────────────────

// Allow requests from React frontend (supports Vite ports 5173, 5174, etc.)
app.use(cors({
  origin: true,
  credentials: true,
}));

// Parse JSON bodies (req.body)
app.use(express.json());

// Parse URL-encoded bodies (form data without files)
app.use(express.urlencoded({ extended: false }));

// Serve uploaded files as static — access via: GET /uploads/<filename>
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ─── Routes ───────────────────────────────────────────────────────────────────

// Auth: register, login, get profile
app.use('/api/auth',     require('./routes/authRoutes'));

// Projects: full CRUD (protected)
app.use('/api/projects', require('./routes/projectRoutes'));

// Tasks: full CRUD with file upload (protected)
app.use('/api/tasks',    require('./routes/taskRoutes'));

// Health check
app.get('/', (req, res) => {
  res.json({ message: '⚡ TaskFlow API is running!' });
});

// ─── Error Handling Middleware ────────────────────────────────────────────────
// These MUST come AFTER all routes

app.use(notFound);      // Catch undefined routes → 404
app.use(errorHandler);  // Handle all errors → consistent JSON

// ─── Start Server ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5001;

const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

server.on('error', (err) => {
  console.error('Server listen error:', err);
});

