# ⚡ TaskFlow — Task Management System

A premium, full-featured **Task & Project Management System** built with **React + Vite**. Manage tasks, projects, and teams with a beautiful dark-themed UI featuring glassmorphism, charts, kanban board, and more.

---

## 🚀 Live Demo

```
http://localhost:5174
```

> Run `npm run dev` inside the `worknest/` folder to start the app.

---

## 🔑 Demo Login Credentials

| Role   | Email                  | Password   |
|--------|------------------------|------------|
| 👑 Admin  | `admin@taskflow.io` | `admin123` |
| 👤 Member | `jane@taskflow.io`  | `jane123`  |
| 👤 Member | `alex@taskflow.io`  | `alex123`  |

> Admin gets access to the **Admin Panel** — all users & all tasks.

---

## 📸 Pages & Screens

### 1. 🔐 Login Page (`/login`)
- Email + Password form
- Show/Hide password toggle
- One-click demo credential fill buttons (Admin / Member)
- Link to Register page
- Error alert on wrong credentials

### 2. 📝 Register Page (`/register`)
- Full Name, Email, Password, Confirm Password fields
- Client-side validation (min 6 chars, email format, password match)
- Auto-login after successful registration
- Link to Login page

### 3. 📊 Dashboard (`/dashboard`)
- **Greeting** based on time of day
- **4 Stat Cards** — Total, Todo, In Progress, Done
- **Overdue tasks** card (if any)
- **Pie Chart** — Tasks by Status (Recharts)
- **Bar Chart** — Tasks per Project (Recharts)
- **Project Progress Bars** — % completion per project
- **Recent Tasks List** — 6 most recent tasks
- **Quick Action** buttons (New Task, View Projects, Admin Panel)

### 4. ✅ Tasks Page (`/tasks`)
- **List View** — tasks stacked vertically with pagination
- **Board View** — 3-column Kanban (Todo / In Progress / Done)
- **Search bar** — filter by task title
- **3 Filters** — by Status, Priority, Project
- **Pagination** — 6 tasks per page, Previous/Next/Page numbers
- **Create Task** button → opens modal
- **Edit / Delete / View** on every Task Card
- Empty state when no tasks match

### 5. 📋 Task Details (`/tasks/:id`)
- Full task info: title, status, priority, due date, project, assignee, created date
- Overdue date shown in red
- File attachment section with **Download** button
- Breadcrumb navigation
- **Inline Edit mode** — edit directly on the page

### 6. ◈ Projects Page (`/projects`)
- Cards for all projects with icon, name, description
- **Progress bar** per project (% tasks done)
- Task count stats (Total / Done / % Complete)
- **Create New Project** form with:
  - Name & Description
  - Color picker (8 colors)
  - Icon/Emoji picker (10 options)
- Delete project button

### 7. 🛡 Admin Panel (`/admin`) — Admin Only
- Summary stat cards (Users, Tasks, Done, Admins)
- **Search bar** across users/tasks
- **Users Tab** — table with name, email, role, join date, task count, delete button
- **Tasks Tab** — table with title, status, priority, due date, creator, delete button
- Admin accounts are protected from deletion

### 8. 🚫 404 Page (`*`)
- Large gradient "404" display
- Back to Dashboard & Go Back buttons
- Shown for any unknown URL

---

## 🧩 Components

| Component | Purpose |
|---|---|
| `Navbar` | Logo, nav links, user avatar + name, logout button |
| `TaskCard` | Task title, status badge, priority badge, due date, Edit/Delete/View |
| `StatusBadge` | Color-coded badge for Todo/In Progress/Done and Low/Medium/High |
| `TaskForm` | Full controlled form — title, description, priority, status, due date, file upload, project, assignee |
| `Loader` | Spinning loader for full-page and inline use |
| `Alert` | Success / Error / Info / Warning dismissible alerts |
| `ProtectedRoute` | Redirects to `/login` if user not authenticated |
| `Footer` | Branded footer on every protected page |

---

## 🗂 Folder Structure

```
worknest/
├── public/
├── src/
│   ├── pages/
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   ├── Dashboard.jsx
│   │   ├── Tasks.jsx
│   │   ├── TaskDetails.jsx
│   │   ├── Projects.jsx
│   │   ├── Admin.jsx
│   │   └── NotFound.jsx
│   ├── components/
│   │   ├── Navbar.jsx
│   │   ├── TaskCard.jsx
│   │   ├── StatusBadge.jsx
│   │   ├── TaskForm.jsx
│   │   ├── Loader.jsx
│   │   ├── Alert.jsx
│   │   ├── ProtectedRoute.jsx
│   │   └── Footer.jsx
│   ├── context/
│   │   └── AuthContext.jsx
│   ├── services/
│   │   └── api.js
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

---

## ⚙️ Tech Stack

| Technology | Usage |
|---|---|
| **React 19** | UI framework |
| **Vite 8** | Build tool & dev server |
| **React Router DOM** | Client-side routing |
| **Recharts** | Pie chart & Bar chart on Dashboard |
| **UUID** | Unique IDs for tasks/projects/users |
| **localStorage** | Mock data persistence (no backend needed) |
| **Vanilla CSS** | Full custom design system (no Tailwind) |
| **Google Fonts** | Inter + Space Grotesk typography |

---

## 🎨 Design System

- **Theme** — Dark glassmorphism with blur effects
- **Primary Color** — `#6c63ff` (Purple)
- **Accent Colors** — Cyan, Green, Amber, Red, Pink
- **Fonts** — Inter (body) + Space Grotesk (headings)
- **Animations** — fadeIn, slideUp, spin, pulse
- **Responsive** — Works on desktop, tablet, and mobile

---

## 🔧 Getting Started

### Prerequisites
- Node.js v18+
- npm v9+

### Installation

```bash
# 1. Go into the project folder
cd worknest

# 2. Install dependencies
npm install

# 3. Start the dev server
npm run dev
```

### Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run Oxlint
```

---

## 🔐 Auth Flow

```
User visits /dashboard
       ↓
Not logged in? → Redirect to /login
       ↓
Login / Register → Session saved to localStorage
       ↓
Access all protected routes
       ↓
Admin role? → Can access /admin
       ↓
Logout → Session cleared → Redirect to /login
```

---

## 📦 Data Storage

All data is stored in **localStorage** (no backend required):

| Key | Stores |
|---|---|
| `tf_users` | All registered users |
| `tf_tasks` | All tasks |
| `tf_projects` | All projects |
| `tf_session` | Currently logged-in user |

> Seed data is automatically loaded on first run with 3 users, 3 projects, and 8 tasks.

---

## ✨ Feature Highlights

- ✅ Register & Login with validation
- ✅ Protected & Admin-only routes
- ✅ Dashboard with Recharts (Pie + Bar)
- ✅ Task CRUD (Create, Read, Update, Delete)
- ✅ Kanban Board (3-column) + List View
- ✅ Search + 3-way filter (status, priority, project)
- ✅ Pagination (6 per page)
- ✅ File upload & download on tasks
- ✅ Assign tasks to team members
- ✅ Project management with color + icon picker
- ✅ Admin panel with user & task management
- ✅ Overdue task detection
- ✅ Responsive design (mobile-friendly)
- ✅ Smooth animations & micro-interactions
- ✅ Empty states & loading spinners

---

## 👨‍💻 Author

Built with ❤️ using React + Vite  
© 2024 TaskFlow — All rights reserved.
