// src/pages/Tasks.jsx
import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getTasks, createTask, updateTask, deleteTask, getProjects, getAllUsers } from '../services/api';
import { useAuth } from '../context/AuthContext';
import TaskCard from '../components/TaskCard';
import Loader from '../components/Loader';
import Alert from '../components/Alert';
import TaskForm from '../components/TaskForm';

const PAGE_SIZE = 8;

export default function Tasks() {
  const { user, isAdmin } = useAuth();
  const [searchParams]      = useSearchParams();
  const [tasks,    setTasks]    = useState([]);
  const [projects, setProjects] = useState([]);
  const [users,    setUsers]    = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [saving,   setSaving]   = useState(false);
  const [alert,    setAlert]    = useState(null);
  const [modal,    setModal]    = useState(false);
  const [editing,  setEditing]  = useState(null);
  const [view,     setView]     = useState('list'); // list | board
  const [search,   setSearch]   = useState('');
  const [filterStatus,   setFilterStatus]   = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [filterProject,  setFilterProject]  = useState('');
  const [page, setPage] = useState(1);

  const load = useCallback(async () => {
    try {
      const [t, p, u] = await Promise.all([
        getTasks(),
        getProjects(),
        getAllUsers(),
      ]);
      setTasks(t || []);
      setProjects(p || []);
      setUsers(u || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { if (searchParams.get('action') === 'new') { setModal(true); setEditing(null); } }, [searchParams]);

  const filtered = tasks.filter(t => {
    if (search && !t.title?.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterStatus && t.status !== filterStatus) return false;
    if (filterPriority && t.priority !== filterPriority) return false;
    if (filterProject) {
      const pId = String(t.projectId || t.project?._id || t.project || '');
      if (pId !== String(filterProject)) return false;
    }
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated  = view === 'board' ? filtered : filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const openCreate = () => { setEditing(null); setModal(true); };
  const openEdit   = (t)  => { setEditing(t); setModal(true); };
  const closeModal = ()   => { setModal(false); setEditing(null); };

  const handleSubmit = async (form) => {
    setSaving(true);
    try {
      const editId = editing?.id || editing?._id;
      if (editId) {
        await updateTask(editId, form);
        setAlert({ type: 'success', message: 'Task updated successfully!' });
      } else {
        await createTask({ ...form, creatorId: user?.id, assigneeId: form.assigneeId || user?.id });
        setAlert({ type: 'success', message: 'Task created successfully!' });
      }
      await load();
      closeModal();
    } catch (e) {
      setAlert({ type: 'error', message: e.message || 'Failed to save task.' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    setTasks(prev => prev.filter(t => String(t.id || t._id) !== String(id)));
    try {
      await deleteTask(id);
      setAlert({ type: 'success', message: 'Task deleted.' });
      await load();
    } catch (e) {
      setAlert({ type: 'error', message: e.message || 'Failed to delete task.' });
      await load();
    }
  };

  const handleStatusChange = async (task, newStatus) => {
    const id = task.id || task._id;
    setTasks(prev => prev.map(t => (String(t.id || t._id) === String(id) ? { ...t, status: newStatus } : t)));
    try {
      await updateTask(id, { ...task, status: newStatus });
    } catch (e) {
      console.error(e);
      await load();
    }
  };

  const COLS = ['todo', 'inprogress', 'done'];
  const COL_LABELS = { todo: 'Todo', inprogress: 'In Progress', done: 'Done' };
  const COL_COLORS = { todo: '#9ca3af', inprogress: '#22d3ee', done: '#34d399' };

  if (loading) return <div style={{ paddingTop: 80 }}><Loader /></div>;

  return (
    <div className="container" style={{ paddingTop: 32, paddingBottom: 48 }}>
      <div className="page-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 className="page-title">Tasks</h1>
          <p className="page-subtitle">{filtered.length} task{filtered.length !== 1 ? 's' : ''} found</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate} id="create-task-btn">✚ New Task</button>
      </div>

      {alert && <div style={{ marginBottom: 16 }}><Alert {...alert} onDismiss={() => setAlert(null)} /></div>}

      {/* Toolbar */}
      <div className="toolbar">
        <div className="search-wrap">
          <span className="search-icon">🔍</span>
          <input className="search-input" placeholder="Search tasks by title…" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
        </div>
        <select className="filter-select" value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setPage(1); }}>
          <option value="">All Statuses</option>
          <option value="todo">Todo</option>
          <option value="inprogress">In Progress</option>
          <option value="done">Done</option>
        </select>
        <select className="filter-select" value={filterPriority} onChange={e => { setFilterPriority(e.target.value); setPage(1); }}>
          <option value="">All Priorities</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
        <select className="filter-select" value={filterProject} onChange={e => { setFilterProject(e.target.value); setPage(1); }}>
          <option value="">All Projects</option>
          {projects.map(p => {
            const pId = p.id || p._id;
            return <option key={pId} value={pId}>{p.name}</option>;
          })}
        </select>
        <div className="view-toggle">
          <button className={`view-btn${view === 'list' ? ' active' : ''}`} onClick={() => setView('list')} title="List view">☰</button>
          <button className={`view-btn${view === 'board' ? ' active' : ''}`} onClick={() => setView('board')} title="Board view">⊞</button>
        </div>
      </div>

      {/* Content */}
      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📭</div>
          <div className="empty-state-title">No tasks found</div>
          <div className="empty-state-msg">Try adjusting your filters or create a new task.</div>
          <button className="btn btn-primary mt-4" onClick={openCreate}>✚ Create Task</button>
        </div>
      ) : view === 'board' ? (
        <div className="board-grid">
          {COLS.map(col => {
            const colTasks = filtered.filter(t => t.status === col);
            return (
              <div key={col} className="board-column">
                <div className="board-column-header">
                  <span className="board-column-title" style={{ color: COL_COLORS[col] }}>{COL_LABELS[col]}</span>
                  <span className="board-column-count">{colTasks.length}</span>
                </div>
                <div className="board-tasks">
                  {colTasks.length === 0
                    ? <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 13, padding: '20px 0' }}>No tasks</div>
                    : colTasks.map(t => {
                        const tId = t.id || t._id;
                        return (
                          <TaskCard
                            key={tId}
                            task={t}
                            onEdit={openEdit}
                            onDelete={handleDelete}
                            onStatusChange={handleStatusChange}
                          />
                        );
                      })
                  }
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {paginated.map(t => {
              const tId = t.id || t._id;
              return (
                <TaskCard
                  key={tId}
                  task={t}
                  onEdit={openEdit}
                  onDelete={handleDelete}
                  onStatusChange={handleStatusChange}
                />
              );
            })}
          </div>
          {totalPages > 1 && (
            <div className="pagination">
              <button className="page-btn" onClick={() => setPage(p => p - 1)} disabled={page === 1}>‹</button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
                <button key={n} className={`page-btn${page === n ? ' active' : ''}`} onClick={() => setPage(n)}>{n}</button>
              ))}
              <button className="page-btn" onClick={() => setPage(p => p + 1)} disabled={page === totalPages}>›</button>
            </div>
          )}
        </>
      )}

      {/* Modal */}
      {modal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && closeModal()}>
          <div className="modal">
            <div className="modal-header">
              <span className="modal-title">{editing ? '✏ Edit Task' : '✚ New Task'}</span>
              <button className="modal-close" onClick={closeModal}>✕</button>
            </div>
            <div className="modal-body" style={{ paddingBottom: 28 }}>
              <TaskForm
                initial={editing}
                projects={projects}
                users={users}
                onSubmit={handleSubmit}
                onCancel={closeModal}
                loading={saving}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
