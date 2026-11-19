// src/pages/TaskDetails.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getTaskById, getProjects, getAllUsers, updateTask, deleteTask } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Loader from '../components/Loader';
import StatusBadge from '../components/StatusBadge';
import Alert from '../components/Alert';
import TaskForm from '../components/TaskForm';

export default function TaskDetails() {
  const { id }        = useParams();
  const navigate      = useNavigate();
  const { isAdmin, user } = useAuth();
  const [task,     setTask]     = useState(null);
  const [projects, setProjects] = useState([]);
  const [users,    setUsers]    = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [editing,  setEditing]  = useState(false);
  const [saving,   setSaving]   = useState(false);
  const [alert,    setAlert]    = useState(null);

  useEffect(() => {
    Promise.all([getTaskById(id), getProjects(), getAllUsers()])
      .then(([t, p, u]) => {
        setTask(t);
        setProjects(p || []);
        setUsers(u || []);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSave = async (form) => {
    setSaving(true);
    try {
      const updated = await updateTask(id, form);
      setTask(updated);
      setAlert({ type: 'success', message: 'Task updated successfully!' });
      setEditing(false);
    } catch (e) {
      setAlert({ type: 'error', message: e.message || 'Failed to update task.' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this task? This action cannot be undone.')) return;
    try {
      await deleteTask(id);
      navigate('/tasks', { replace: true });
    } catch (e) {
      setAlert({ type: 'error', message: e.message || 'Failed to delete task.' });
    }
  };

  const handleStatusToggle = async (newStatus) => {
    try {
      const updated = await updateTask(id, { ...task, status: newStatus });
      setTask(updated);
      setAlert({ type: 'success', message: `Status updated to ${newStatus}!` });
    } catch (e) {
      setAlert({ type: 'error', message: e.message || 'Failed to update status.' });
    }
  };

  if (loading) return <div style={{ paddingTop: 80 }}><Loader /></div>;
  if (!task) return (
    <div className="container" style={{ paddingTop: 80 }}>
      <Alert type="error" message="Task not found." dismissible={false} />
      <Link to="/tasks" className="btn btn-secondary mt-4">← Back to Tasks</Link>
    </div>
  );

  const pId = String(task.projectId || task.project?._id || task.project || '');
  const aId = String(task.assigneeId || task.assignedTo?._id || task.assignedTo || '');
  const project  = projects.find(p => String(p.id || p._id) === pId);
  const assignee = users.find(u => String(u.id || u._id) === aId);

  return (
    <div className="container" style={{ paddingTop: 32, paddingBottom: 48 }}>
      {/* Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: 'var(--text-muted)', marginBottom: 20 }}>
        <Link to="/tasks" style={{ color: 'var(--accent-primary)', textDecoration: 'none' }}>Tasks</Link>
        <span>›</span>
        <span className="truncate" style={{ maxWidth: 300 }}>{task.title}</span>
      </div>

      {alert && <div style={{ marginBottom: 20 }}><Alert {...alert} onDismiss={() => setAlert(null)} /></div>}

      {editing ? (
        <div className="glass-card" style={{ padding: 32 }}>
          <h2 className="modal-title" style={{ marginBottom: 24 }}>✏ Edit Task</h2>
          <TaskForm initial={task} projects={projects} users={users} onSubmit={handleSave} onCancel={() => setEditing(false)} loading={saving} />
        </div>
      ) : (
        <>
          <div className="task-detail-header">
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
              <h1 style={{ fontSize: 24, fontWeight: 800, fontFamily: 'var(--font-display)', flex: 1 }}>{task.title}</h1>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <button className="btn btn-secondary btn-sm" onClick={() => setEditing(true)}>✏ Edit</button>
                <button className="btn btn-danger btn-sm" onClick={handleDelete}>🗑 Delete</button>
                <button className="btn btn-ghost btn-sm" onClick={() => navigate('/tasks')}>← Back to Tasks</button>
              </div>
            </div>

            <div className="task-detail-meta" style={{ marginTop: 16 }}>
              <div className="task-detail-meta-item">
                <span>📌 Status:</span>
                <select
                  className="form-select"
                  value={task.status}
                  onChange={(e) => handleStatusToggle(e.target.value)}
                  style={{ width: 'auto', padding: '4px 8px', fontSize: 13 }}
                >
                  <option value="todo">Todo</option>
                  <option value="inprogress">In Progress</option>
                  <option value="done">Done</option>
                </select>
              </div>
              <div className="task-detail-meta-item"><span>⚡ Priority:</span><StatusBadge priority={task.priority} /></div>
              {task.dueDate && (
                <div className="task-detail-meta-item">
                  <span>📅 Due:</span>
                  <strong style={{ color: new Date(task.dueDate) < new Date() && task.status !== 'done' ? 'var(--accent-red)' : 'var(--text-primary)' }}>
                    {new Date(task.dueDate).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'long', day: 'numeric' })}
                  </strong>
                </div>
              )}
              {project && (
                <div className="task-detail-meta-item">
                  <span>◈ Project:</span>
                  <strong>{project.icon} {project.name}</strong>
                </div>
              )}
              {assignee && (
                <div className="task-detail-meta-item">
                  <span>👤 Assignee:</span>
                  <strong>{assignee.name}</strong>
                </div>
              )}
              <div className="task-detail-meta-item">
                <span>🗓 Created:</span>
                <strong>{new Date(task.createdAt || Date.now()).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</strong>
              </div>
            </div>
          </div>

          {task.description && (
            <div className="task-detail-body">
              <div className="task-detail-section-title">Description</div>
              <p style={{ fontSize: 15, lineHeight: 1.7, color: 'var(--text-secondary)', whiteSpace: 'pre-wrap' }}>{task.description}</p>
            </div>
          )}

          {task.fileName && (
            <div className="task-detail-body">
              <div className="task-detail-section-title">Attachment</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <span style={{ fontSize: 32 }}>📎</span>
                <div>
                  <div style={{ fontWeight: 600, marginBottom: 6, fontSize: 15 }}>{task.fileName}</div>
                  {task.fileUrl ? (
                    <a
                      href={task.fileUrl}
                      download={task.fileName}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-primary btn-sm"
                    >
                      ⬇ Download / View File
                    </a>
                  ) : (
                    <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Attached locally with task</span>
                  )}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
