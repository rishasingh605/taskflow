// src/pages/Projects.jsx
import { useState, useEffect } from 'react';
import { getProjects, createProject, updateProject, deleteProject, getTasks } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Loader from '../components/Loader';
import Alert from '../components/Alert';

const COLORS = ['#6c63ff','#22d3ee','#34d399','#fbbf24','#f87171','#f472b6','#a78bfa','#fb923c'];
const ICONS  = ['📁','🎨','📱','🔌','🚀','📊','🛠','🌐','💡','🔬','⚡','🎯'];

const EMPTY = { name: '', description: '', color: COLORS[0], icon: ICONS[0] };

export default function Projects() {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [tasks,    setTasks]    = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [form,     setForm]     = useState(EMPTY);
  const [editing,  setEditing]  = useState(null); // null = new, project obj = editing
  const [errors,   setErrors]   = useState({});
  const [saving,   setSaving]   = useState(false);
  const [alert,    setAlert]    = useState(null);
  const [showForm, setShowForm] = useState(false);

  const load = async () => {
    try {
      const [p, t] = await Promise.all([getProjects(), getTasks()]);
      setProjects(p || []);
      setTasks(t || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const set = (k, v) => { setForm(p => ({ ...p, [k]: v })); setErrors(p => ({ ...p, [k]: '' })); };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Project name is required.';
    return e;
  };

  const handleOpenCreate = () => {
    setEditing(null);
    setForm(EMPTY);
    setErrors({});
    setShowForm(true);
  };

  const handleOpenEdit = (p) => {
    setEditing(p);
    setForm({
      name: p.name || '',
      description: p.description || '',
      color: p.color || COLORS[0],
      icon: p.icon || ICONS[0],
    });
    setErrors({});
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSaving(true);
    try {
      if (editing) {
        const id = editing.id || editing._id;
        await updateProject(id, form);
        setAlert({ type: 'success', message: 'Project updated successfully!' });
      } else {
        await createProject({ ...form, ownerId: user?.id });
        setAlert({ type: 'success', message: 'Project created successfully!' });
      }
      setForm(EMPTY);
      setEditing(null);
      setShowForm(false);
      await load();
    } catch (err) {
      setAlert({ type: 'error', message: err.message || 'Operation failed.' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    // Immediate UI update
    setProjects(prev => prev.filter(p => String(p.id || p._id) !== String(id)));
    
    try {
      await deleteProject(id);
      setAlert({ type: 'success', message: 'Project deleted successfully.' });
      await load();
    } catch (err) {
      setAlert({ type: 'error', message: err.message || 'Failed to delete project.' });
      await load();
    }
  };

  if (loading) return <div style={{ paddingTop: 80 }}><Loader /></div>;

  return (
    <div className="container" style={{ paddingTop: 32, paddingBottom: 48 }}>
      <div className="page-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 className="page-title">Projects</h1>
          <p className="page-subtitle">{projects.length} project{projects.length !== 1 ? 's' : ''} total</p>
        </div>
        <button className="btn btn-primary" onClick={showForm ? () => setShowForm(false) : handleOpenCreate} id="new-project-btn">
          {showForm ? '✕ Close Form' : '✚ New Project'}
        </button>
      </div>

      {alert && <div style={{ marginBottom: 20 }}><Alert {...alert} onDismiss={() => setAlert(null)} /></div>}

      {/* Create / Edit Form */}
      {showForm && (
        <div className="glass-card animate-slideUp" style={{ padding: 28, marginBottom: 28 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20, fontFamily: 'var(--font-display)' }}>
            {editing ? `✏ Edit Project: ${editing.name}` : 'Create New Project'}
          </h2>
          <form onSubmit={handleSubmit} className="auth-form" noValidate>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Project Name *</label>
                <input className="form-input" value={form.name} onChange={e => set('name', e.target.value)} placeholder="My Awesome Project" />
                {errors.name && <p className="form-error">{errors.name}</p>}
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <input className="form-input" value={form.description} onChange={e => set('description', e.target.value)} placeholder="What's this project about?" />
              </div>
            </div>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Color Theme</label>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                  {COLORS.map(c => (
                    <button key={c} type="button" onClick={() => set('color', c)}
                      style={{ width: 30, height: 30, borderRadius: '50%', background: c, border: form.color === c ? '3px solid white' : '2px solid transparent', outline: form.color === c ? `2px solid ${c}` : 'none', cursor: 'pointer', transition: 'all 0.2s' }} />
                  ))}
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Icon</label>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {ICONS.map(ic => (
                    <button key={ic} type="button" onClick={() => set('icon', ic)}
                      style={{ width: 36, height: 36, borderRadius: 8, fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', background: form.icon === ic ? 'var(--accent-primary)' : 'var(--bg-elevated)', border: form.icon === ic ? '2px solid white' : '1px solid var(--border-default)', cursor: 'pointer', transition: 'all 0.2s' }}>
                      {ic}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', paddingTop: 8 }}>
              <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? <><span className="spinner spinner-sm" /> Saving…</> : (editing ? '💾 Save Changes' : '✚ Create Project')}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Projects Grid */}
      {projects.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">◈</div>
          <div className="empty-state-title">No projects yet</div>
          <div className="empty-state-msg">Create your first project to organize your tasks.</div>
          <button className="btn btn-primary mt-4" onClick={handleOpenCreate}>✚ Create Project</button>
        </div>
      ) : (
        <div className="projects-grid">
          {projects.map(p => {
            const pId = p.id || p._id;
            const pTasks = tasks.filter(t => (t.projectId === pId || t.project === pId || t.project?._id === pId));
            const pDone  = pTasks.filter(t => t.status === 'done').length;
            const pct    = pTasks.length ? Math.round(pDone / pTasks.length * 100) : 0;
            return (
              <div key={pId} className="project-card animate-fadeIn" style={{ '--project-color': p.color || '#6c63ff' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div className="project-icon">{p.icon || '📁'}</div>
                  <div style={{ display: 'flex', gap: 8, position: 'relative', zIndex: 10 }}>
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      style={{ padding: '6px 12px', fontSize: 13 }}
                      onClick={(e) => { e.stopPropagation(); handleOpenEdit(p); }}
                      title="Edit project"
                    >
                      ✏ Edit
                    </button>
                    <button
                      type="button"
                      className="btn btn-danger btn-sm"
                      style={{ padding: '6px 12px', fontSize: 13 }}
                      onClick={(e) => { e.stopPropagation(); handleDelete(pId); }}
                      title="Delete project"
                    >
                      🗑 Delete
                    </button>
                  </div>
                </div>
                <div className="project-name">{p.name}</div>
                <div className="project-desc">{p.description || 'No description provided.'}</div>
                <div style={{ height: 6, background: 'var(--bg-elevated)', borderRadius: 99, marginBottom: 12, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${pct}%`, background: p.color || '#6c63ff', borderRadius: 99, transition: 'width 0.6s ease' }} />
                </div>
                <div className="project-stats">
                  <div className="project-stat"><strong>{pTasks.length}</strong>Tasks</div>
                  <div className="project-stat"><strong>{pDone}</strong>Done</div>
                  <div className="project-stat"><strong>{pct}%</strong>Complete</div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
