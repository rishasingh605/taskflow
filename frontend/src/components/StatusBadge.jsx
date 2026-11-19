// src/components/StatusBadge.jsx
export default function StatusBadge({ status, priority }) {
  if (priority) {
    const map = { low: 'Low', medium: 'Medium', high: 'High' };
    const cls  = { low: 'badge-low', medium: 'badge-medium', high: 'badge-high' };
    const icon = { low: '▽', medium: '◇', high: '△' };
    return (
      <span className={`badge ${cls[priority] || 'badge-low'}`}>
        {icon[priority]} {map[priority] || priority}
      </span>
    );
  }

  const map  = { todo: 'Todo', inprogress: 'In Progress', done: 'Done' };
  const cls  = { todo: 'badge-todo', inprogress: 'badge-inprogress', done: 'badge-done' };
  const dots = { todo: '#9ca3af', inprogress: '#22d3ee', done: '#34d399' };
  const key  = (status || '').toLowerCase().replace(/\s/g, '');

  return (
    <span className={`badge ${cls[key] || 'badge-todo'}`}>
      <span className="dot" style={{ background: dots[key] || dots.todo }} />
      {map[key] || status}
    </span>
  );
}
