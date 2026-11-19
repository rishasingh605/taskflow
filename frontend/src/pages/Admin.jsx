// src/pages/Admin.jsx
import { useState, useEffect } from 'react';
import { getAllUsers, getTasks, deleteUser, deleteTask } from '../services/api';
import Loader from '../components/Loader';
import StatusBadge from '../components/StatusBadge';
import Alert from '../components/Alert';

export default function Admin() {
  const [users,   setUsers]   = useState([]);
  const [tasks,   setTasks]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab,     setTab]     = useState('users');
  const [alert,   setAlert]   = useState(null);
  const [search,  setSearch]  = useState('');

  const load = async () => {
    setLoading(true);
    const [u, t] = await Promise.all([getAllUsers(), getTasks(null, true)]);
    setUsers(u); setTasks(t); setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Delete this user? All their tasks will remain.')) return;
    setUsers(prev => prev.filter(u => String(u.id || u._id) !== String(id)));
    try {
      await deleteUser(id);
      setAlert({ type: 'success', message: 'User deleted.' });
    } catch (e) {
      setAlert({ type: 'error', message: e.message || 'Failed to delete user.' });
    }
    await load();
  };

  const handleDeleteTask = async (id) => {
    if (!window.confirm('Delete this task?')) return;
    setTasks(prev => prev.filter(t => String(t.id || t._id) !== String(id)));
    try {
      await deleteTask(id);
      setAlert({ type: 'success', message: 'Task deleted.' });
    } catch (e) {
      setAlert({ type: 'error', message: e.message || 'Failed to delete task.' });
    }
    await load();
  };

  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );
  const filteredTasks = tasks.filter(t =>
    t.title.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div style={{ paddingTop: 80 }}><Loader /></div>;

  return (
    <div className="container" style={{ paddingTop: 32, paddingBottom: 48 }}>
      <div className="page-header">
        <div className="admin-header">
          <h1 className="page-title" style={{ marginBottom: 0 }}>Admin Panel</h1>
          <span className="admin-badge">🛡 Admin Only</span>
        </div>
        <p className="page-subtitle">Manage all users and tasks across the platform.</p>
      </div>

      {alert && <div style={{ marginBottom: 20 }}><Alert {...alert} onDismiss={() => setAlert(null)} /></div>}

      {/* Summary Cards */}
      <div className="stat-cards" style={{ marginBottom: 24 }}>
        <div className="stat-card" style={{ '--card-color': '#6c63ff' }}>
          <div className="stat-card-icon" style={{ color: '#6c63ff' }}>👥</div>
          <div className="stat-card-value" style={{ color: '#6c63ff' }}>{users.length}</div>
          <div className="stat-card-label">Total Users</div>
        </div>
        <div className="stat-card" style={{ '--card-color': '#22d3ee' }}>
          <div className="stat-card-icon" style={{ color: '#22d3ee' }}>📋</div>
          <div className="stat-card-value" style={{ color: '#22d3ee' }}>{tasks.length}</div>
          <div className="stat-card-label">Total Tasks</div>
        </div>
        <div className="stat-card" style={{ '--card-color': '#34d399' }}>
          <div className="stat-card-icon" style={{ color: '#34d399' }}>✅</div>
          <div className="stat-card-value" style={{ color: '#34d399' }}>{tasks.filter(t => t.status === 'done').length}</div>
          <div className="stat-card-label">Tasks Done</div>
        </div>
        <div className="stat-card" style={{ '--card-color': '#f87171' }}>
          <div className="stat-card-icon" style={{ color: '#f87171' }}>👑</div>
          <div className="stat-card-value" style={{ color: '#f87171' }}>{users.filter(u => u.role === 'admin').length}</div>
          <div className="stat-card-label">Admins</div>
        </div>
      </div>

      {/* Search */}
      <div className="toolbar" style={{ marginBottom: 16 }}>
        <div className="search-wrap">
          <span className="search-icon">🔍</span>
          <input className="search-input" placeholder={`Search ${tab}…`} value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs">
        <button className={`tab-btn${tab === 'users' ? ' active' : ''}`} onClick={() => { setTab('users'); setSearch(''); }}>
          👥 Users ({users.length})
        </button>
        <button className={`tab-btn${tab === 'tasks' ? ' active' : ''}`} onClick={() => { setTab('tasks'); setSearch(''); }}>
          📋 Tasks ({tasks.length})
        </button>
      </div>

      {/* Users Table */}
      {tab === 'users' && (
        <div className="glass-card" style={{ overflow: 'hidden' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Role</th>
                <th>Joined</th>
                <th>Tasks</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 32 }}>No users found.</td></tr>
              ) : filteredUsers.map(u => {
                const initials = u.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
                const uTasks   = tasks.filter(t => t.creatorId === u.id || t.assigneeId === u.id).length;
                return (
                  <tr key={u.id || u._id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div className="avatar">{initials}</div>
                        <span style={{ fontWeight: 600 }}>{u.name}</span>
                      </div>
                    </td>
                    <td style={{ color: 'var(--text-secondary)' }}>{u.email}</td>
                    <td>
                      <span className={`badge ${u.role === 'admin' ? 'badge-high' : 'badge-todo'}`}>
                        {u.role === 'admin' ? '👑 Admin' : '👤 Member'}
                      </span>
                    </td>
                    <td style={{ color: 'var(--text-muted)' }}>{u.createdAt}</td>
                    <td style={{ fontWeight: 700 }}>{uTasks}</td>
                    <td>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDeleteUser(u.id || u._id)} disabled={u.role === 'admin'} title={u.role === 'admin' ? 'Cannot delete admin' : 'Delete user'}>
                        🗑 Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Tasks Table */}
      {tab === 'tasks' && (
        <div className="glass-card" style={{ overflow: 'hidden' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Status</th>
                <th>Priority</th>
                <th>Due Date</th>
                <th>Creator</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredTasks.length === 0 ? (
                <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 32 }}>No tasks found.</td></tr>
              ) : filteredTasks.map(t => {
                const creator = users.find(u => String(u.id || u._id) === String(t.creatorId || ''));
                return (
                  <tr key={t.id || t._id}>
                    <td style={{ fontWeight: 600, maxWidth: 240 }}>
                      <span className="truncate" style={{ display: 'block' }}>{t.title}</span>
                    </td>
                    <td><StatusBadge status={t.status} /></td>
                    <td><StatusBadge priority={t.priority} /></td>
                    <td style={{ color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                      {t.dueDate ? new Date(t.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                    </td>
                    <td style={{ color: 'var(--text-secondary)' }}>{creator?.name || '—'}</td>
                    <td><button className="btn btn-danger btn-sm" onClick={() => handleDeleteTask(t.id || t._id)}>🗑 Delete</button></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
