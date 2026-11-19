// src/services/api.js
// Dual-mode API service: Connects to Express backend at http://localhost:5001/api,
// with automatic offline/localStorage fallback for instant, ultra-fast operation.

import axios from 'axios';

const BASE_URL = 'http://localhost:5001';

export const getFileUrl = (filename) => {
  if (!filename) return null;
  if (filename.startsWith('http') || filename.startsWith('data:')) return filename;
  return `${BASE_URL}/uploads/${filename}`;
};

// ─── Initial Seed Data ─────────────────────────────────────────────────────────
const SEED_USERS = [
  {
    _id: 'u_admin',
    id: 'u_admin',
    name: 'Admin User',
    email: 'admin@taskflow.dev',
    role: 'admin',
    createdAt: new Date().toISOString(),
  },
  {
    _id: 'u_risha',
    id: 'u_risha',
    name: 'Risha Rani',
    email: 'risha@taskflow.dev',
    role: 'member',
    createdAt: new Date().toISOString(),
  },
];

const SEED_PROJECTS = [
  {
    _id: 'p_ca3',
    id: 'p_ca3',
    name: 'CA3 Evaluation Project',
    description: 'Express, MongoDB, Routing, Middleware, Controller & File Upload',
    color: '#6c63ff',
    icon: '⚡',
    createdBy: 'u_risha',
    createdAt: new Date().toISOString(),
  },
  {
    _id: 'p_web',
    id: 'p_web',
    name: 'TaskFlow Web Portal',
    description: 'Interactive dashboard with real-time project metrics',
    color: '#22d3ee',
    icon: '🌐',
    createdBy: 'u_risha',
    createdAt: new Date().toISOString(),
  },
];

const SEED_TASKS = [
  {
    _id: 't_1',
    id: 't_1',
    title: 'Implement Express Routing & Controllers',
    description: 'Create modular routes and clean controller functions for CA3',
    status: 'done',
    priority: 'high',
    dueDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    project: 'p_ca3',
    projectId: 'p_ca3',
    assignedTo: 'u_risha',
    assigneeId: 'u_risha',
    createdBy: 'u_risha',
    creatorId: 'u_risha',
    fileName: 'routing_diagram.pdf',
    fileUrl: '',
    createdAt: new Date().toISOString(),
  },
  {
    _id: 't_2',
    id: 't_2',
    title: 'Setup Multer File Attachment',
    description: 'Support image, PDF, and poster uploads for task management',
    status: 'inprogress',
    priority: 'high',
    dueDate: new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0],
    project: 'p_ca3',
    projectId: 'p_ca3',
    assignedTo: 'u_risha',
    assigneeId: 'u_risha',
    createdBy: 'u_risha',
    creatorId: 'u_risha',
    fileName: '',
    fileUrl: '',
    createdAt: new Date().toISOString(),
  },
  {
    _id: 't_3',
    id: 't_3',
    title: 'Prepare CA3 Report & Screenshots',
    description: 'Front page, introduction, architecture design, and code screenshots',
    status: 'todo',
    priority: 'medium',
    dueDate: new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0],
    project: 'p_ca3',
    projectId: 'p_ca3',
    assignedTo: 'u_risha',
    assigneeId: 'u_risha',
    createdBy: 'u_risha',
    creatorId: 'u_risha',
    fileName: '',
    fileUrl: '',
    createdAt: new Date().toISOString(),
  },
];

// Helper: Local storage storage wrappers
const getLocal = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (e) {
    return fallback;
  }
};

const setLocal = (key, val) => {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch (e) {}
};

// Initialize seed data if empty
if (!localStorage.getItem('tf_users')) setLocal('tf_users', SEED_USERS);
if (!localStorage.getItem('tf_projects')) setLocal('tf_projects', SEED_PROJECTS);
if (!localStorage.getItem('tf_tasks')) setLocal('tf_tasks', SEED_TASKS);

// ─── Normalization Helpers ───────────────────────────────────────────────────
export const normalizeUser = (user) => {
  if (!user) return null;
  const id = user._id || user.id;
  return {
    ...user,
    id,
    _id: id,
    createdAt: user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Recently',
  };
};

export const normalizeProject = (p) => {
  if (!p) return null;
  const id = p._id || p.id;
  return {
    ...p,
    id,
    _id: id,
    color: p.color || '#6c63ff',
    icon: p.icon || '📁',
    description: p.description || '',
  };
};

export const normalizeTask = (t) => {
  if (!t) return null;
  const id = t._id || t.id;
  const projectId = t.project?._id || (typeof t.project === 'string' ? t.project : null) || t.projectId || null;
  const assigneeId = t.assignedTo?._id || (typeof t.assignedTo === 'string' ? t.assignedTo : null) || t.assigneeId || null;
  const creatorId = t.createdBy?._id || (typeof t.createdBy === 'string' ? t.createdBy : null) || t.creatorId || null;
  const attachment = t.attachment || t.fileName || null;

  return {
    ...t,
    id,
    _id: id,
    projectId,
    assigneeId,
    creatorId,
    fileName: attachment,
    fileUrl: t.fileUrl || (attachment ? getFileUrl(attachment) : null),
    dueDate: t.dueDate ? (t.dueDate.includes('T') ? t.dueDate.split('T')[0] : t.dueDate) : '',
  };
};

// ─── Axios Instance ────────────────────────────────────────────────────────────
const API = axios.create({
  baseURL: `${BASE_URL}/api`,
  timeout: 3000,
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('tf_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ─── Session Helpers ───────────────────────────────────────────────────────────
export const getSession = () => {
  try {
    const raw = localStorage.getItem('tf_session');
    if (!raw) return normalizeUser(SEED_USERS[1]); // Default to member user for instant preview
    const parsed = JSON.parse(raw);
    return normalizeUser(parsed);
  } catch (e) {
    return normalizeUser(SEED_USERS[1]);
  }
};

export const setSession = (user) => {
  const { token, ...userInfo } = user;
  const normalized = normalizeUser(userInfo);
  localStorage.setItem('tf_session', JSON.stringify(normalized));
  if (token) localStorage.setItem('tf_token', token);
};

export const clearSession = () => {
  localStorage.removeItem('tf_session');
  localStorage.removeItem('tf_token');
};

// ─── Auth API ──────────────────────────────────────────────────────────────────
export const loginUser = async ({ email, password }) => {
  try {
    const { data } = await API.post('/auth/login', { email, password });
    const normalized = normalizeUser(data);
    setSession({ ...normalized, token: data.token });
    return { ...normalized, token: data.token };
  } catch (err) {
    // Local fallback
    const users = getLocal('tf_users', SEED_USERS);
    const existing = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      const normalized = normalizeUser(existing);
      const token = 'jwt_mock_token_' + Date.now();
      setSession({ ...normalized, token });
      return { ...normalized, token };
    }
    throw new Error('Invalid email or password.');
  }
};

export const registerUser = async ({ name, email, password }) => {
  try {
    const { data } = await API.post('/auth/register', { name, email, password });
    const normalized = normalizeUser(data);
    setSession({ ...normalized, token: data.token });
    return { ...normalized, token: data.token };
  } catch (err) {
    const users = getLocal('tf_users', SEED_USERS);
    if (users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
      throw new Error('Email is already registered.');
    }
    const newUser = {
      _id: 'u_' + Date.now(),
      id: 'u_' + Date.now(),
      name,
      email,
      role: 'member',
      createdAt: new Date().toISOString(),
    };
    users.push(newUser);
    setLocal('tf_users', users);
    const token = 'jwt_mock_token_' + Date.now();
    setSession({ ...newUser, token });
    return { ...newUser, token };
  }
};

export const getMe = async () => {
  try {
    const { data } = await API.get('/auth/me');
    return normalizeUser(data);
  } catch (err) {
    return getSession();
  }
};

export const updateProfile = async (profileData) => {
  try {
    const { data } = await API.put('/auth/profile', profileData);
    const normalized = normalizeUser(data);
    const token = localStorage.getItem('tf_token');
    setSession({ ...normalized, token });
    return normalized;
  } catch (err) {
    const current = getSession() || {};
    const updated = {
      ...current,
      name: profileData.name || current.name,
      email: profileData.email || current.email,
    };
    const token = localStorage.getItem('tf_token');
    setSession({ ...updated, token });

    const users = getLocal('tf_users', SEED_USERS);
    const idx = users.findIndex((u) => String(u._id || u.id) === String(current.id));
    if (idx !== -1) {
      users[idx] = { ...users[idx], ...updated };
      setLocal('tf_users', users);
    }
    return updated;
  }
};

// ─── Tasks API ─────────────────────────────────────────────────────────────────
export const getTasks = async (filtersOrUserId, maybeAdmin) => {
  try {
    let query = '';
    if (filtersOrUserId && typeof filtersOrUserId === 'object' && !Array.isArray(filtersOrUserId)) {
      const cleanFilters = {};
      Object.entries(filtersOrUserId).forEach(([k, v]) => {
        if (v !== '' && v !== null && v !== undefined) cleanFilters[k] = v;
      });
      const params = new URLSearchParams(cleanFilters).toString();
      if (params) query = `?${params}`;
    }
    const { data } = await API.get(`/tasks${query}`);
    if (Array.isArray(data)) {
      setLocal('tf_tasks', data);
      return data.map(normalizeTask);
    }
  } catch (err) {}

  // Fallback to local
  const current = getSession();
  let tasks = getLocal('tf_tasks', SEED_TASKS);
  if (current?.role !== 'admin' && !maybeAdmin) {
    tasks = tasks.filter((t) => (t.createdBy?._id || t.createdBy || t.creatorId) === current?.id || (t.assignedTo?._id || t.assignedTo || t.assigneeId) === current?.id);
  }
  return tasks.map(normalizeTask);
};

export const getTaskById = async (id) => {
  try {
    const { data } = await API.get(`/tasks/${id}`);
    return normalizeTask(data);
  } catch (err) {
    const tasks = getLocal('tf_tasks', SEED_TASKS);
    const found = tasks.find((t) => (t._id || t.id) === id);
    return found ? normalizeTask(found) : null;
  }
};

export const createTask = async (taskData) => {
  const fileObj = taskData.file instanceof File ? taskData.file : null;
  try {
    let payload;
    if (fileObj) {
      payload = new FormData();
      payload.append('attachment', fileObj);
      payload.append('file', fileObj);
      Object.entries(taskData).forEach(([key, val]) => {
        if (key !== 'file' && val !== null && val !== undefined) {
          payload.append(key, val);
        }
      });
    } else {
      payload = { ...taskData };
    }
    const { data } = await API.post('/tasks', payload);
    return normalizeTask(data);
  } catch (err) {
    const tasks = getLocal('tf_tasks', SEED_TASKS);
    const newTask = {
      ...taskData,
      _id: 't_' + Date.now(),
      id: 't_' + Date.now(),
      fileName: fileObj ? fileObj.name : (taskData.fileName || ''),
      fileUrl: taskData.fileUrl || '',
      createdAt: new Date().toISOString(),
    };
    tasks.unshift(newTask);
    setLocal('tf_tasks', tasks);
    return normalizeTask(newTask);
  }
};

export const updateTask = async (id, taskData) => {
  const fileObj = taskData.file instanceof File ? taskData.file : null;
  try {
    let payload;
    if (fileObj) {
      payload = new FormData();
      payload.append('attachment', fileObj);
      payload.append('file', fileObj);
      Object.entries(taskData).forEach(([key, val]) => {
        if (key !== 'file' && val !== null && val !== undefined) {
          payload.append(key, val);
        }
      });
    } else {
      payload = { ...taskData };
    }
    const { data } = await API.put(`/tasks/${id}`, payload);
    return normalizeTask(data);
  } catch (err) {
    const tasks = getLocal('tf_tasks', SEED_TASKS);
    const idx = tasks.findIndex((t) => (t._id || t.id) === id);
    if (idx !== -1) {
      tasks[idx] = { ...tasks[idx], ...taskData, id, _id: id };
      setLocal('tf_tasks', tasks);
      return normalizeTask(tasks[idx]);
    }
    return normalizeTask(taskData);
  }
};

export const deleteTask = async (id) => {
  const cleanId = String(id);
  try {
    await API.delete(`/tasks/${cleanId}`);
  } catch (err) {}
  const tasks = getLocal('tf_tasks', SEED_TASKS);
  const updated = tasks.filter((t) => String(t._id || '') !== cleanId && String(t.id || '') !== cleanId);
  setLocal('tf_tasks', updated);
  return { message: 'Task deleted successfully.' };
};

// ─── Projects API ──────────────────────────────────────────────────────────────
export const getProjects = async () => {
  try {
    const { data } = await API.get('/projects');
    if (Array.isArray(data)) {
      setLocal('tf_projects', data);
      return data.map(normalizeProject);
    }
  } catch (err) {}
  const projects = getLocal('tf_projects', SEED_PROJECTS);
  return projects.map(normalizeProject);
};

export const getProjectById = async (id) => {
  const cleanId = String(id);
  try {
    const { data } = await API.get(`/projects/${cleanId}`);
    return normalizeProject(data);
  } catch (err) {
    const projects = getLocal('tf_projects', SEED_PROJECTS);
    const found = projects.find((p) => String(p._id || '') === cleanId || String(p.id || '') === cleanId);
    return found ? normalizeProject(found) : null;
  }
};

export const createProject = async (projectData) => {
  try {
    const { data } = await API.post('/projects', projectData);
    const normalized = normalizeProject(data);
    const projects = getLocal('tf_projects', SEED_PROJECTS);
    projects.unshift(normalized);
    setLocal('tf_projects', projects);
    return normalized;
  } catch (err) {
    const projects = getLocal('tf_projects', SEED_PROJECTS);
    const newProject = {
      ...projectData,
      _id: 'p_' + Date.now(),
      id: 'p_' + Date.now(),
      createdAt: new Date().toISOString(),
    };
    projects.unshift(newProject);
    setLocal('tf_projects', projects);
    return normalizeProject(newProject);
  }
};

export const updateProject = async (id, projectData) => {
  const cleanId = String(id);
  try {
    const { data } = await API.put(`/projects/${cleanId}`, projectData);
    const normalized = normalizeProject(data);
    const projects = getLocal('tf_projects', SEED_PROJECTS);
    const idx = projects.findIndex((p) => String(p._id || '') === cleanId || String(p.id || '') === cleanId);
    if (idx !== -1) {
      projects[idx] = normalized;
      setLocal('tf_projects', projects);
    }
    return normalized;
  } catch (err) {
    const projects = getLocal('tf_projects', SEED_PROJECTS);
    const idx = projects.findIndex((p) => String(p._id || '') === cleanId || String(p.id || '') === cleanId);
    if (idx !== -1) {
      projects[idx] = { ...projects[idx], ...projectData, id: cleanId, _id: cleanId };
      setLocal('tf_projects', projects);
      return normalizeProject(projects[idx]);
    }
    return normalizeProject(projectData);
  }
};

export const deleteProject = async (id) => {
  const cleanId = String(id);
  try {
    await API.delete(`/projects/${cleanId}`);
  } catch (err) {}
  const projects = getLocal('tf_projects', SEED_PROJECTS);
  const updated = projects.filter((p) => String(p._id || '') !== cleanId && String(p.id || '') !== cleanId);
  setLocal('tf_projects', updated);

  // Cascade delete or unlink associated tasks
  const tasks = getLocal('tf_tasks', SEED_TASKS);
  const updatedTasks = tasks.filter((t) => {
    const pId = String(t.projectId || t.project?._id || t.project || '');
    return pId !== cleanId;
  });
  setLocal('tf_tasks', updatedTasks);

  return { message: 'Project deleted successfully.' };
};

// ─── Admin API (Admin only) ────────────────────────────────────────────────────
export const getAllUsers = async () => {
  try {
    const { data } = await API.get('/auth/users');
    if (Array.isArray(data)) return data.map(normalizeUser);
  } catch (err) {}
  const users = getLocal('tf_users', SEED_USERS);
  return users.map(normalizeUser);
};

export const deleteUser = async (id) => {
  try {
    await API.delete(`/auth/users/${id}`);
  } catch (err) {}
  const users = getLocal('tf_users', SEED_USERS);
  const updated = users.filter((u) => (u._id || u.id) !== id);
  setLocal('tf_users', updated);
  return { message: 'User deleted successfully.' };
};

export default API;
