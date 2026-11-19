// src/pages/Profile.jsx
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { updateProfile, getTasks } from '../services/api';
import Loader from '../components/Loader';
import Alert from '../components/Alert';

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    password: '',
  });
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    if (user) {
      setForm(prev => ({
        ...prev,
        name: user.name || '',
        email: user.email || '',
      }));
    }
  }, [user]);

  useEffect(() => {
    getTasks()
      .then(t => setTasks(t || []))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const initials = user?.name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || '??';

  const userTasks = tasks.filter(t => {
    const uid = String(user?.id || user?._id || '');
    return String(t.creatorId || '') === uid || String(t.assigneeId || '') === uid;
  });
  const doneTasks = userTasks.filter(t => t.status === 'done');
  const inProgressTasks = userTasks.filter(t => t.status === 'inprogress');
  const completionRate = userTasks.length ? Math.round((doneTasks.length / userTasks.length) * 100) : 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim()) {
      setAlert({ type: 'error', message: 'Name and email are required.' });
      return;
    }
    setSaving(true);
    setAlert(null);
    try {
      const payload = { name: form.name.trim(), email: form.email.trim() };
      if (form.password.trim()) {
        if (form.password.length < 6) {
          throw new Error('New password must be at least 6 characters.');
        }
        payload.password = form.password;
      }
      const updated = await updateProfile(payload);
      if (updateUser) updateUser(updated);
      setForm(prev => ({ ...prev, password: '' }));
      setAlert({ type: 'success', message: 'Profile updated successfully!' });
    } catch (err) {
      setAlert({ type: 'error', message: err.message || 'Failed to update profile.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div style={{ paddingTop: 80 }}><Loader /></div>;

  return (
    <div className="container" style={{ paddingTop: 32, paddingBottom: 48, maxWidth: 900 }}>
      <div className="page-header">
        <h1 className="page-title">User Profile</h1>
        <p className="page-subtitle">Manage your personal account settings and security</p>
      </div>

      {alert && <div style={{ marginBottom: 20 }}><Alert {...alert} onDismiss={() => setAlert(null)} /></div>}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 24, alignItems: 'start' }}>
        {/* Left Column: User Card & Stats */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="glass-card" style={{ padding: 24, textAlign: 'center' }}>
            <div
              className="avatar"
              style={{
                width: 72,
                height: 72,
                fontSize: 26,
                margin: '0 auto 16px auto',
                background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-cyan))',
                boxShadow: '0 8px 24px rgba(108, 99, 255, 0.4)',
              }}
            >
              {initials}
            </div>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>{user?.name}</h2>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 12 }}>{user?.email}</p>
            <span className={`badge ${user?.role === 'admin' ? 'badge-high' : 'badge-todo'}`}>
              {user?.role === 'admin' ? '👑 Administrator' : '👤 Team Member'}
            </span>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 16 }}>
              Joined: {user?.createdAt || 'Recently'}
            </div>
          </div>

          <div className="glass-card" style={{ padding: 20 }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 16, textTransform: 'uppercase', letterSpacing: 1 }}>
              Your Activity
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Assigned Tasks</span>
                <strong style={{ fontSize: 15 }}>{userTasks.length}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Completed</span>
                <strong style={{ fontSize: 15, color: 'var(--accent-green)' }}>{doneTasks.length}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>In Progress</span>
                <strong style={{ fontSize: 15, color: 'var(--accent-cyan)' }}>{inProgressTasks.length}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Completion Rate</span>
                <strong style={{ fontSize: 15, color: 'var(--accent-primary)' }}>{completionRate}%</strong>
              </div>
            </div>
            <div style={{ height: 6, background: 'var(--bg-elevated)', borderRadius: 99, marginTop: 14, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${completionRate}%`, background: 'var(--accent-green)', borderRadius: 99, transition: 'width 0.5s ease' }} />
            </div>
          </div>
        </div>

        {/* Right Column: Edit Profile Form */}
        <div className="glass-card" style={{ padding: 32 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20, fontFamily: 'var(--font-display)' }}>
            Edit Account Details
          </h2>
          <form onSubmit={handleSubmit} className="auth-form" noValidate>
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input
                className="form-input"
                type="text"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                placeholder="Your full name"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email Address *</label>
              <input
                className="form-input"
                type="email"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                placeholder="your.email@example.com"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Change Password (leave blank to keep current)</label>
              <input
                className="form-input"
                type="password"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                placeholder="•••••••• (Min 6 characters)"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Account Role</label>
              <input
                className="form-input"
                type="text"
                value={user?.role === 'admin' ? 'Administrator (Full Access)' : 'Standard Member'}
                disabled
                style={{ opacity: 0.7, cursor: 'not-allowed' }}
              />
              <span style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4, display: 'block' }}>
                Role is managed by system administrator.
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 24 }}>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={saving}
                style={{ padding: '10px 24px', fontSize: 14 }}
              >
                {saving ? <><span className="spinner spinner-sm" /> Saving…</> : '💾 Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
