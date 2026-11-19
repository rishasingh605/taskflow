// src/pages/NotFound.jsx
import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="not-found-page">
      <div className="auth-bg-orb auth-bg-orb-1" style={{ opacity: 0.08 }} />
      <div className="auth-bg-orb auth-bg-orb-2" style={{ opacity: 0.08 }} />
      <div className="not-found-code">404</div>
      <h1 className="not-found-title">Page Not Found</h1>
      <p className="not-found-msg">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
        <Link to="/dashboard" className="btn btn-primary btn-lg">⊞ Go to Dashboard</Link>
        <button className="btn btn-secondary btn-lg" onClick={() => history.back()}>← Go Back</button>
      </div>
    </div>
  );
}
