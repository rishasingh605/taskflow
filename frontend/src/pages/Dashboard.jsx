// src/pages/Dashboard.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getTasks, getProjects } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Loader from '../components/Loader';
import StatusBadge from '../components/StatusBadge';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend,
} from 'recharts';

const COLORS = { todo: '#9ca3af', inprogress: '#22d3ee', done: '#34d399' };

const StatCard = ({ icon, label, value, color, delta }) => (
  <div className="stat-card" style={{ '--card-color': color }}>
    <div className="stat-card-icon" style={{ color }}>{icon}</div>
    <div className="stat-card-value" style={{ color }}>{value}</div>
    <div className="stat-card-label">{label}</div>
    {delta && <div className="stat-card-delta">{delta}</div>}
  </div>
);

function RecentTaskRow({ task }) {
  return (
    <Link to={`/tasks/${task.id}`} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: '1px solid var(--border-subtle)', textDecoration: 'none' }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="truncate" style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-primary)' }}>{task.title}</div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
          {task.dueDate ? `Due ${new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}` : 'No due date'}
        </div>
      </div>
      <StatusBadge status={task.status} />
      <StatusBadge priority={task.priority} />
    </Link>
  );
}

export default function Dashboard() {
  const { user, isAdmin } = useAuth();
  const [tasks,    setTasks]    = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    Promise.all([getTasks(user.id, isAdmin), getProjects()])
      .then(([t, p]) => { setTasks(t); setProjects(p); })
      .finally(() => setLoading(false));
  }, [user.id, isAdmin]);

  if (loading) return <div style={{ paddingTop: 80 }}><Loader /></div>;

  const total      = tasks.length;
  const todo       = tasks.filter(t => t.status === 'todo').length;
  const inprogress = tasks.filter(t => t.status === 'inprogress').length;
  const done       = tasks.filter(t => t.status === 'done').length;
  const overdue    = tasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'done').length;

  const pieData = [
    { name: 'Todo',        value: todo,       fill: COLORS.todo },
    { name: 'In Progress', value: inprogress, fill: COLORS.inprogress },
    { name: 'Done',        value: done,       fill: COLORS.done },
  ].filter(d => d.value > 0);

  const barData = projects.map(p => {
    const pId = String(p.id || p._id || '');
    return {
      name: p.name.length > 12 ? p.name.slice(0, 12) + '…' : p.name,
      Todo:        tasks.filter(t => String(t.projectId || t.project?._id || t.project || '') === pId && t.status === 'todo').length,
      'In Progress': tasks.filter(t => String(t.projectId || t.project?._id || t.project || '') === pId && t.status === 'inprogress').length,
      Done:        tasks.filter(t => String(t.projectId || t.project?._id || t.project || '') === pId && t.status === 'done').length,
    };
  });

  const recentTasks = [...tasks].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 6);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="container" style={{ paddingTop: 32, paddingBottom: 48 }}>
      {/* Header */}
      <div className="page-header">
        <h1 className="page-title">{greeting}, {user.name.split(' ')[0]} 👋</h1>
        <p className="page-subtitle">Here's what's happening across your tasks today.</p>
      </div>

      {/* Stat Cards */}
      <div className="stat-cards">
        <StatCard icon="📋" label="Total Tasks"  value={total}      color="#6c63ff" delta={`${projects.length} projects`} />
        <StatCard icon="⏳" label="Todo"         value={todo}       color="#9ca3af" />
        <StatCard icon="🔄" label="In Progress"  value={inprogress} color="#22d3ee" />
        <StatCard icon="✅" label="Completed"    value={done}       color="#34d399" delta={total > 0 ? `${Math.round(done/total*100)}% completion` : ''} />
        {overdue > 0 && <StatCard icon="⚠" label="Overdue" value={overdue} color="#f87171" />}
      </div>

      {/* Dashboard Grid */}
      <div className="dashboard-grid">
        {/* Left Column */}
        <div>
          {/* Charts */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
            <div className="chart-card">
              <div className="chart-title">Tasks by Status</div>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={4} dataKey="value">
                    {pieData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                  </Pie>
                  <Tooltip
                    contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', borderRadius: 8, color: 'var(--text-primary)', fontSize: 13 }}
                    formatter={(value, name) => [value, name]}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center', marginTop: 4 }}>
                {Object.entries(COLORS).map(([k, c]) => (
                  <span key={k} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--text-secondary)' }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: c, flexShrink: 0 }} />
                    {k === 'inprogress' ? 'In Progress' : k.charAt(0).toUpperCase() + k.slice(1)}
                  </span>
                ))}
              </div>
            </div>

            <div className="chart-card">
              <div className="chart-title">Tasks per Project</div>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={barData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', borderRadius: 8, color: 'var(--text-primary)', fontSize: 13 }} />
                  <Bar dataKey="Todo"        fill={COLORS.todo}       radius={[3,3,0,0]} />
                  <Bar dataKey="In Progress" fill={COLORS.inprogress} radius={[3,3,0,0]} />
                  <Bar dataKey="Done"        fill={COLORS.done}       radius={[3,3,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Recent Tasks */}
          <div className="chart-card">
            <div className="section-header">
              <div className="section-title">Recent Tasks</div>
              <Link to="/tasks" className="btn btn-ghost btn-sm">View all →</Link>
            </div>
            {recentTasks.length === 0
              ? <div className="empty-state"><div className="empty-state-icon">📭</div><div className="empty-state-title">No tasks yet</div></div>
              : recentTasks.map(t => <RecentTaskRow key={t.id} task={t} />)
            }
          </div>
        </div>

        {/* Right Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Quick Actions */}
          <div className="chart-card">
            <div className="section-title" style={{ marginBottom: 14 }}>Quick Actions</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <Link to="/tasks?action=new" className="btn btn-primary w-full" style={{ justifyContent: 'center' }}>✚ New Task</Link>
              <Link to="/projects" className="btn btn-secondary w-full" style={{ justifyContent: 'center' }}>◈ View Projects</Link>
              {isAdmin && <Link to="/admin" className="btn btn-secondary w-full" style={{ justifyContent: 'center' }}>🛡 Admin Panel</Link>}
            </div>
          </div>

          {/* Progress by Project */}
          <div className="chart-card">
            <div className="section-title" style={{ marginBottom: 14 }}>Project Progress</div>
            {projects.length === 0
              ? <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>No projects yet.</p>
              : projects.map(p => {
                  const pId = String(p.id || p._id || '');
                  const pTasks = tasks.filter(t => String(t.projectId || t.project?._id || t.project || '') === pId);
                  const pDone  = pTasks.filter(t => t.status === 'done').length;
                  const pct    = pTasks.length ? Math.round(pDone / pTasks.length * 100) : 0;
                  return (
                    <div key={pId} style={{ marginBottom: 16 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 13 }}>
                        <span style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span>{p.icon}</span>{p.name}
                        </span>
                        <span style={{ color: 'var(--text-muted)' }}>{pct}%</span>
                      </div>
                      <div style={{ height: 6, background: 'var(--bg-elevated)', borderRadius: 99, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${pct}%`, background: p.color, borderRadius: 99, transition: 'width 0.6s ease' }} />
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>{pDone}/{pTasks.length} tasks done</div>
                    </div>
                  );
                })}
          </div>
        </div>
      </div>
    </div>
  );
}
