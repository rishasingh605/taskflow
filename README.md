# ⚡ TaskFlow — Full Stack Task Management System

A full-stack, enterprise-grade **Task & Project Management System** featuring a **React + Vite** frontend with glassmorphism UI and a **Node.js + Express + MongoDB** REST API backend with JWT authentication, role-based access control, and file uploads.

---

## 🏗️ Architecture & Project Structure

```text
taskflow/
├── backend/                  # Node.js + Express + MongoDB REST API
│   ├── config/               # Database connection
│   ├── controllers/          # Business logic (Auth, Projects, Tasks)
│   ├── middleware/           # Auth (JWT), Upload (Multer), Error handling
│   ├── models/               # Mongoose schemas (User, Project, Task)
│   ├── routes/               # API route definitions
│   ├── uploads/              # File uploads directory
│   ├── .env.example          # Environment variables template
│   ├── package.json
│   └── server.js
│
├── frontend/                 # React 19 + Vite Frontend (WorkNest)
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── pages/            # App views & dashboards
│   │   ├── context/          # State management & AuthContext
│   │   ├── api/              # Axios API clients & service calls
│   │   └── App.jsx
│   ├── package.json
│   └── vite.config.js
│
├── CA3_Project_Report.md     # Detailed Project Documentation & Report
├── .gitignore
└── README.md
```

---

## ✨ Key Features

- **Authentication & Authorization**: Secure JWT-based auth with bcrypt password hashing and Role-Based Access Control (Admin / Member).
- **Kanban Board & Task Tracking**: Drag-and-drop / status progression for tasks (`To Do`, `In Progress`, `Review`, `Done`).
- **Project Management**: Create, view, update, and manage team projects.
- **Analytics & Dashboard**: Recharts-powered analytics for task completion and team activity.
- **File Attachments**: Upload task attachments (PDF, PNG, JPG) using Multer.
- **Modern UI**: Dark-themed glassmorphism interface with smooth micro-interactions.

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [MongoDB](https://www.mongodb.com/) (Local instance or MongoDB Atlas cluster)

### 2. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Edit .env to set your MONGO_URI and JWT_SECRET
npm run dev
```
Backend runs by default at `http://localhost:5000`.

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Frontend runs by default at `http://localhost:5173` or `http://localhost:5174`.

---

## 🔑 Demo Credentials

| Role | Email | Password |
|---|---|---|
| 👑 Admin | `admin@taskflow.io` | `admin123` |
| 👤 Member | `jane@taskflow.io` | `jane123` |
| 👤 Member | `alex@taskflow.io` | `alex123` |

---

## 📜 License
ISC / Educational
