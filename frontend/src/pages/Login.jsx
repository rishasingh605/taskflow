// src/pages/Login.jsx
import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { loginUser } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Alert from '../components/Alert';

export default function Login() {
  const { login } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();
  const from      = location.state?.from?.pathname || '/dashboard';

  const [form,    setForm]    = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');
  const [showPw,  setShowPw]  = useState(false);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) { setError('Please fill in all fields.'); return; }
    setLoading(true); setError('');
    try {
      const user = await loginUser(form);
      login(user);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (role) => {
    if (role === 'admin') setForm({ email: 'admin@taskflow.dev', password: 'password123' });
    else setForm({ email: 'risha@taskflow.dev', password: 'password123' });
  };

  return (
    <div className="auth-page">
      <div className="auth-bg-orb auth-bg-orb-1" />
      <div className="auth-bg-orb auth-bg-orb-2" />

      <div className="auth-card">
        <div className="auth-logo-wrap">
          <div className="auth-logo-icon">⚡</div>
          <h1 className="auth-title gradient-text">Welcome back</h1>
          <p className="auth-subtitle">Sign in to your TaskFlow account</p>
        </div>

        {error && <div style={{ marginBottom: 16 }}><Alert type="error" message={error} onDismiss={() => setError('')} /></div>}

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label className="form-label" htmlFor="email">Email</label>
            <div className="input-with-icon">
              <span className="input-icon">✉</span>
              <input id="email" type="email" className="form-input" value={form.email}
                onChange={e => set('email', e.target.value)} placeholder="you@example.com" autoComplete="email" />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">Password</label>
            <div className="input-with-icon">
              <span className="input-icon">🔒</span>
              <input id="password" type={showPw ? 'text' : 'password'} className="form-input"
                value={form.password} onChange={e => set('password', e.target.value)}
                placeholder="••••••••" autoComplete="current-password"
                style={{ paddingRight: 44 }} />
              <button type="button" onClick={() => setShowPw(p => !p)}
                style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: 16 }}>
                {showPw ? '🙈' : '👁'}
              </button>
            </div>
          </div>

          <button type="submit" className="btn btn-primary w-full btn-lg" disabled={loading} id="login-btn">
            {loading ? <><span className="spinner spinner-sm" /> Signing in…</> : '→ Sign In'}
          </button>
        </form>

        <div className="auth-divider" style={{ marginTop: 20 }}>Quick Demo</div>
        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
          <button className="btn btn-secondary btn-sm" style={{ flex: 1 }} onClick={() => fillDemo('admin')}>👑 Admin</button>
          <button className="btn btn-secondary btn-sm" style={{ flex: 1 }} onClick={() => fillDemo('member')}>👤 Member</button>
        </div>

        <p className="auth-footer">
          No account? <Link to="/register" className="auth-link">Create one →</Link>
        </p>
      </div>
    </div>
  );
}
