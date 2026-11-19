# ⚡ TaskFlow — Backend API (CA3)

**CAP646 Full Stack Web Development — CA3 Assessment**  
Node.js + Express.js + MongoDB (Mongoose) REST API

---

## 📁 Project Structure

```
backend/
├── config/
│   └── db.js                          ← MongoDB connection (Mongoose)
├── controllers/
│   ├── authController.js              ← Register, Login, Get Profile
│   ├── projectController.js           ← Project CRUD
│   └── taskController.js              ← Task CRUD + file upload
├── middleware/
│   ├── authMiddleware.js              ← JWT protect + adminOnly
│   ├── uploadMiddleware.js            ← Multer (jpg/png/pdf, max 5MB)
│   └── errorMiddleware.js             ← notFound + errorHandler
├── models/
│   ├── User.js                        ← User schema (bcrypt hashing)
│   ├── Project.js                     ← Project schema
│   └── Task.js                        ← Task schema (with attachment)
├── routes/
│   ├── authRoutes.js                  ← /api/auth/*
│   ├── projectRoutes.js               ← /api/projects/*
│   └── taskRoutes.js                  ← /api/tasks/*
├── uploads/                           ← Uploaded files saved here
├── .env                               ← Secret config (not in git)
├── .env.example                       ← Template for .env
├── .gitignore
├── package.json
├── server.js                          ← Entry point
└── TaskFlow_CA3.postman_collection.json
```

---

## 🚀 Setup & Run

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Configure Environment Variables
```bash
cp .env.example .env
```
Edit `.env`:
```
PORT=5001
MONGO_URI=mongodb://127.0.0.1:27017/taskflow?directConnection=true
JWT_SECRET=your_secret_key_here
JWT_EXPIRES_IN=7d
```
> **Note**: Port `5001` is used to prevent port conflict with macOS AirPlay Receiver which uses port 5000.  
> For **MongoDB Atlas**, replace `MONGO_URI` with your Atlas connection string.

### 3. Start the Server
```bash
npm run dev     # Development (auto-restarts with nodemon)
npm start       # Production
```

Server runs at: **http://localhost:5001**

---

## 📦 Dependencies

| Package | Version | Purpose |
|---|---|---|
| `express` | ^4.19 | Web framework |
| `mongoose` | ^8.5 | MongoDB ODM |
| `dotenv` | ^16.4 | Load .env variables |
| `bcryptjs` | ^2.4 | Password hashing |
| `jsonwebtoken` | ^9.0 | JWT auth tokens |
| `multer` | ^1.4 | File uploads |
| `cors` | ^2.8 | Cross-origin requests |
| `nodemon` | ^3.1 | Dev: auto-restart |

---

## 🔗 API Endpoints

### Auth Routes — `/api/auth`

| Method | Endpoint | Access | Description | Body / Notes |
|---|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Register new user | `{ name, email, password }` |
| `POST` | `/api/auth/login` | Public | Login, get JWT token | `{ email, password }` |
| `GET` | `/api/auth/me` | 🔒 Protected | Get logged-in user profile | Token required |

### Project Routes — `/api/projects`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/projects` | 🔒 Protected | Get all projects (admin=all, member=own) |
| `POST` | `/api/projects` | 🔒 Protected | Create a project |
| `GET` | `/api/projects/:id` | 🔒 Protected | Get one project |
| `PUT` | `/api/projects/:id` | 🔒 Protected | Update a project |
| `DELETE` | `/api/projects/:id` | 🔒 Protected | Delete a project |

### Task Routes — `/api/tasks`

| Method | Endpoint | Access | Description | Notes |
|---|---|---|---|---|
| `GET` | `/api/tasks` | 🔒 Protected | Get all tasks | Query: `?status=todo&priority=high&project=id` |
| `POST` | `/api/tasks` | 🔒 Protected | Create task | `form-data` with optional `attachment` file |
| `GET` | `/api/tasks/:id` | 🔒 Protected | Get one task | |
| `PUT` | `/api/tasks/:id` | 🔒 Protected | Update task | `form-data` for file, JSON otherwise |
| `DELETE` | `/api/tasks/:id` | 🔒 Protected | Delete task | |

### File Access
```
GET http://localhost:5000/uploads/<filename>
```

---

## 📋 HTTP Status Codes Used

| Code | Meaning | When used |
|---|---|---|
| `200` | OK | GET, PUT, DELETE success |
| `201` | Created | POST success (register, create task/project) |
| `400` | Bad Request | Missing fields, duplicate email, invalid data |
| `401` | Unauthorized | No token / wrong password |
| `403` | Forbidden | Not your resource, not admin |
| `404` | Not Found | Task/Project doesn't exist, unknown route |
| `500` | Server Error | Unexpected database/server errors |

---

## 🔐 Authentication Flow

```
1. POST /api/auth/login → returns { token }
2. Store token in localStorage
3. Every protected request → Header: Authorization: Bearer <token>
4. authMiddleware verifies token → attaches req.user
5. Controller uses req.user._id and req.user.role
```

---

## 📤 File Upload Details

- **Middleware:** Multer (`uploadMiddleware.js`)
- **Field name:** `attachment` (form-data key)
- **Allowed types:** `.jpg`, `.jpeg`, `.png`, `.pdf`
- **Max size:** 5 MB
- **Storage:** `backend/uploads/` folder
- **Access URL:** `http://localhost:5000/uploads/<filename>`

**Postman — Upload a file:**
1. Set method to `POST`, URL to `/api/tasks`
2. Go to **Body → form-data**
3. Add key `attachment`, change type to **File**, select your file
4. Add other keys: `title`, `status`, `priority`, etc.

---

## 🗄️ MongoDB Models

### User
```js
{ name, email (unique), password (hashed), role: 'admin'|'member', timestamps }
```

### Project
```js
{ name, description, color, icon, createdBy → User, timestamps }
```

### Task
```js
{
  title, description,
  status: 'todo'|'inprogress'|'done',
  priority: 'low'|'medium'|'high',
  dueDate,
  project → Project,
  assignedTo → User,
  createdBy → User,
  attachment (filename string),
  timestamps
}
```

---

## 🧪 Testing with Postman

1. Import `TaskFlow_CA3.postman_collection.json` into Postman
2. Set collection variable `base_url` = `http://localhost:5000`
3. Run **Register** → copy the `token` from response
4. Set collection variable `token` = copied token
5. Run all other requests in order

---

## 🏗️ Key Concepts (Viva Reference)

| Concept | Where Used | File |
|---|---|---|
| **Express Router** | Separate route files | `routes/*.js` |
| **Controllers** | Business logic separated | `controllers/*.js` |
| **JWT Middleware** | Protect private routes | `middleware/authMiddleware.js` |
| **Multer** | File uploads | `middleware/uploadMiddleware.js` |
| **Error Middleware** | Consistent JSON errors | `middleware/errorMiddleware.js` |
| **Mongoose populate** | Join related documents | `taskController.js` |
| **bcryptjs** | Hash passwords | `models/User.js` (pre-save hook) |
| **dotenv** | Env variables | `.env` + `server.js` |
| **CORS** | Allow frontend requests | `server.js` |
| **Static files** | Serve uploaded files | `server.js` (`/uploads`) |

---

## 👨‍💻 Author

**CAP646 CA3 — TaskFlow Backend**  
Built with Node.js + Express + MongoDB  
© 2024
