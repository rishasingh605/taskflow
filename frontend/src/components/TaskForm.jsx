// src/components/TaskForm.jsx
import { useState, useEffect } from 'react';
import Alert from './Alert';

const STATUSES   = ['todo', 'inprogress', 'done'];
const PRIORITIES = ['low', 'medium', 'high'];

const EMPTY = {
  title: '', description: '', priority: 'medium',
  status: 'todo', dueDate: '', projectId: '', assigneeId: '',
  fileName: '', fileUrl: '',
};

export default function TaskForm({ initial = null, projects = [], users = [], onSubmit, onCancel, loading = false }) {
  const [form,   setForm]   = useState({ ...EMPTY, ...initial });
  const [errors, setErrors] = useState({});
  const [file,   setFile]   = useState(null);
  const [alert,  setAlert]  = useState(null);

  useEffect(() => { setForm({ ...EMPTY, ...initial }); }, [initial]);

  const set = (k, v) => { setForm(prev => ({ ...prev, [k]: v })); setErrors(prev => ({ ...prev, [k]: '' })); };

  const validate = () => {
    const e = {};
    if (!form.title.trim())   e.title   = 'Title is required.';
    if (form.title.length > 100) e.title = 'Title must be ≤ 100 characters.';
    if (!form.dueDate)        e.dueDate = 'Due date is required.';
    return e;
  };

  const handleFile = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f);
    set('fileName', f.name);
    const reader = new FileReader();
    reader.onload = (ev) => set('fileUrl', ev.target.result);
    reader.readAsDataURL(f);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const e2 = validate();
    if (Object.keys(e2).length) { setErrors(e2); return; }
    try {
      await onSubmit({ ...form, file });
      setAlert({ type: 'success', message: initial?.id ? 'Task updated!' : 'Task created!' });
    } catch (err) {
      setAlert({ type: 'error', message: err.message });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="auth-form" noValidate>
      {alert && <Alert {...alert} dismissible onDismiss={() => setAlert(null)} />}

      <div className="form-group">
        <label className="form-label">Title *</label>
        <input className="form-input" value={form.title} onChange={e => set('title', e.target.value)} placeholder="Task title…" maxLength={100} />
        {errors.title && <p className="form-error">{errors.title}</p>}
      </div>

      <div className="form-group">
        <label className="form-label">Description</label>
        <textarea className="form-textarea" value={form.description} onChange={e => set('description', e.target.value)} placeholder="Add more details…" rows={3} />
      </div>

      <div className="grid-2">
        <div className="form-group">
          <label className="form-label">Priority</label>
          <select className="form-select" value={form.priority} onChange={e => set('priority', e.target.value)}>
            {PRIORITIES.map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Status</label>
          <select className="form-select" value={form.status} onChange={e => set('status', e.target.value)}>
            {STATUSES.map(s => <option key={s} value={s}>{s === 'inprogress' ? 'In Progress' : s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
          </select>
        </div>
      </div>

      <div className="grid-2">
        <div className="form-group">
          <label className="form-label">Due Date *</label>
          <input type="date" className="form-input" value={form.dueDate} onChange={e => set('dueDate', e.target.value)} />
          {errors.dueDate && <p className="form-error">{errors.dueDate}</p>}
        </div>

        {projects.length > 0 && (
          <div className="form-group">
            <label className="form-label">Project</label>
            <select className="form-select" value={form.projectId} onChange={e => set('projectId', e.target.value)}>
              <option value="">No Project</option>
              {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
        )}
      </div>

      {users.length > 0 && (
        <div className="form-group">
          <label className="form-label">Assign To</label>
          <select className="form-select" value={form.assigneeId} onChange={e => set('assigneeId', e.target.value)}>
            <option value="">Unassigned</option>
            {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
          </select>
        </div>
      )}

      <div className="form-group">
        <label className="form-label">Attachment</label>
        {form.fileName ? (
          <div className="file-selected">
            <span>📎</span>
            <span className="file-selected-name">{form.fileName}</span>
            <button type="button" className="btn btn-ghost btn-sm" style={{ padding: '2px 8px' }} onClick={() => { set('fileName', ''); set('fileUrl', ''); setFile(null); }}>✕</button>
          </div>
        ) : (
          <label className="file-upload-label" htmlFor="file-upload-input">
            <span className="file-upload-icon">⬆</span>
            <span className="file-upload-text">Click to upload a file</span>
            <span className="file-upload-hint">Any file type, up to 10 MB</span>
            <input id="file-upload-input" type="file" className="file-upload-input" onChange={handleFile} />
          </label>
        )}
      </div>

      <div className="modal-footer" style={{ padding: 0, paddingTop: 8 }}>
        <button type="button" className="btn btn-secondary" onClick={onCancel} disabled={loading}>Cancel</button>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? <><span className="spinner spinner-sm" />{initial?.id ? 'Saving…' : 'Creating…'}</> : (initial?.id ? '💾 Save Changes' : '✚ Create Task')}
        </button>
      </div>
    </form>
  );
}
