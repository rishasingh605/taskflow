// src/components/Navbar.jsx
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const links = [
  { to: '/dashboard', label: 'Dashboard', icon: '⊞' },
  { to: '/tasks',     label: 'Tasks',     icon: '✓' },
  { to: '/projects',  label: 'Projects',  icon: '◈' },
  { to: '/profile',   label: 'Profile',   icon: '👤' },
];

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  const initials = user?.name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || '??';

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <div className="navbar-logo" onClick={() => navigate('/dashboard')} style={{ cursor: 'pointer' }}>
          <div className="navbar-logo-icon">⚡</div>
          <span className="gradient-text">TaskFlow</span>
        </div>

        <div className="navbar-links">
          {links.map(l => (
            <NavLink key={l.to} to={l.to} className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
              <span>{l.icon}</span>{l.label}
            </NavLink>
          ))}
          {isAdmin && (
            <NavLink to="/admin" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
              <span>🛡</span>Admin
            </NavLink>
          )}
        </div>

        <div className="navbar-spacer" />

        <div className="navbar-right">
          <NavLink
            to="/profile"
            className={({ isActive }) => `navbar-user${isActive ? ' active' : ''}`}
            title="View & Edit Profile"
          >
            <div className="avatar">{initials}</div>
            <div>
              <div className="user-name">{user?.name}</div>
              <div className="user-role">{user?.role}</div>
            </div>
          </NavLink>
          <button className="btn btn-ghost btn-sm" onClick={handleLogout} title="Logout">
            ⎋ Logout
          </button>
        </div>
      </div>
    </nav>
  );
}
