// src/pages/Register.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerUser } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Alert from '../components/Alert';

export default function Register() {
  const { login } = useAuth();
  const navigate  = useNavigate();

  const [form,    setForm]    = useState({ name: '', email: '', password: '', confirm: '' });
  const [errors,  setErrors]  = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError,setApiError]= useState('');
  const [showPw,  setShowPw]  = useState(false);

  const set = (k, v) => { setForm(p => ({ ...p, [k]: v })); setErrors(p => ({ ...p, [k]: '' })); };

  const validate = () => {
    const e = {};
    if (!form.name.trim())       e.name     = 'Name is required.';
    if (!form.email.includes('@')) e.email   = 'Enter a valid email.';
    if (form.password.length < 6) e.password = 'Password must be at least 6 characters.';
    if (form.password !== form.confirm) e.confirm = 'Passwords do not match.';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true); setApiError('');
    try {
      const user = await registerUser({ name: form.name, email: form.email, password: form.password });
      login(user);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setApiError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-bg-orb auth-bg-orb-1" style={{ right: '-100px', left: 'auto' }} />
      <div className="auth-bg-orb auth-bg-orb-2" style={{ top: '-50px', bottom: 'auto' }} />

      <div className="auth-card">
        <div className="auth-logo-wrap">
          <div className="auth-logo-icon">⚡</div>
          <h1 className="auth-title gradient-text">Create Account</h1>
          <p className="auth-subtitle">Join TaskFlow and start managing tasks</p>
        </div>

        {apiError && <div style={{ marginBottom: 16 }}><Alert type="error" message={apiError} onDismiss={() => setApiError('')} /></div>}

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label className="form-label" htmlFor="reg-name">Full Name</label>
            <div className="input-with-icon">
              <span className="input-icon">👤</span>
              <input id="reg-name" type="text" className="form-input" value={form.name}
                onChange={e => set('name', e.target.value)} placeholder="Jane Smith" />
            </div>
            {errors.name && <p className="form-error">{errors.name}</p>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="reg-email">Email</label>
            <div className="input-with-icon">
              <span className="input-icon">✉</span>
              <input id="reg-email" type="email" className="form-input" value={form.email}
                onChange={e => set('email', e.target.value)} placeholder="you@example.com" />
            </div>
            {errors.email && <p className="form-error">{errors.email}</p>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="reg-password">Password</label>
            <div className="input-with-icon">
              <span className="input-icon">🔒</span>
              <input id="reg-password" type={showPw ? 'text' : 'password'} className="form-input"
                value={form.password} onChange={e => set('password', e.target.value)}
                placeholder="Min. 6 characters" style={{ paddingRight: 44 }} />
              <button type="button" onClick={() => setShowPw(p => !p)}
                style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: 16 }}>
                {showPw ? '🙈' : '👁'}
              </button>
            </div>
            {errors.password && <p className="form-error">{errors.password}</p>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="reg-confirm">Confirm Password</label>
            <div className="input-with-icon">
              <span className="input-icon">🔑</span>
              <input id="reg-confirm" type={showPw ? 'text' : 'password'} className="form-input"
                value={form.confirm} onChange={e => set('confirm', e.target.value)} placeholder="Repeat password" />
            </div>
            {errors.confirm && <p className="form-error">{errors.confirm}</p>}
          </div>

          <button type="submit" className="btn btn-primary w-full btn-lg" disabled={loading} id="register-btn">
            {loading ? <><span className="spinner spinner-sm" /> Creating account…</> : '→ Create Account'}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account? <Link to="/login" className="auth-link">Sign In →</Link>
        </p>
      </div>
    </div>
  );
}
