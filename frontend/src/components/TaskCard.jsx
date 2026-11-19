// src/components/TaskCard.jsx
import { useNavigate } from 'react-router-dom';
import StatusBadge from './StatusBadge';

const PRIORITY_COLORS = { high: '#f87171', medium: '#fbbf24', low: '#34d399' };

function formatDate(d) {
  if (!d) return '—';
  const date = new Date(d);
  const now   = new Date();
  const diff  = Math.ceil((date - now) / 86400000);
  const label = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  if (diff < 0)   return `⚠ ${label} (overdue)`;
  if (diff === 0) return `🔥 Today`;
  if (diff === 1) return `⏰ Tomorrow`;
  return `📅 ${label}`;
}

const NEXT_STATUS = {
  todo: 'inprogress',
  inprogress: 'done',
  done: 'todo',
};

const STATUS_TEXT = {
  todo: 'Mark In Progress ➔',
  inprogress: 'Mark as Done ✓',
  done: 'Reopen Task ↺',
};

export default function TaskCard({ task, onEdit, onDelete, onStatusChange, compact = false }) {
  const navigate = useNavigate();
  const color = PRIORITY_COLORS[task.priority] || '#6c63ff';
  const taskId = task.id || task._id;

  const handleNextStatus = (e) => {
    e.stopPropagation();
    if (onStatusChange) {
      const next = NEXT_STATUS[task.status] || 'todo';
      onStatusChange(task, next);
    }
  };

  return (
    <div className="task-card animate-fadeIn" style={{ '--priority-color': color }}>
      <div className="task-card-header">
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            className="task-card-title truncate"
            style={{ cursor: 'pointer' }}
            onClick={() => navigate(`/tasks/${taskId}`)}
            title="View details"
          >
            {task.title}
          </div>
          <div className="task-card-meta">
            <span style={{ cursor: 'pointer' }} onClick={handleNextStatus} title="Click to cycle status">
              <StatusBadge status={task.status} />
            </span>
            <StatusBadge priority={task.priority} />
            {!compact && (
              <span className="task-card-due">{formatDate(task.dueDate)}</span>
            )}
          </div>
        </div>
      </div>

      {task.description && !compact && (
        <p className="truncate" style={{ fontSize: 13, color: 'var(--text-muted)', margin: '6px 0 8px 0' }}>
          {task.description}
        </p>
      )}

      {task.fileName && (
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8, display: 'flex', gap: 6, alignItems: 'center' }}>
          <span>📎</span>
          <span className="truncate" style={{ maxWidth: 200, color: 'var(--text-secondary)' }}>{task.fileName}</span>
        </div>
      )}

      {!compact && (
        <div className="task-card-actions" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
          {onStatusChange ? (
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              style={{ fontSize: 11, padding: '4px 8px', color: 'var(--accent-primary)' }}
              onClick={handleNextStatus}
            >
              {STATUS_TEXT[task.status] || 'Update Status'}
            </button>
          ) : <div />}

          <div style={{ display: 'flex', gap: 6, position: 'relative', zIndex: 10 }}>
            <button type="button" className="btn btn-ghost btn-sm" onClick={(e) => { e.stopPropagation(); navigate(`/tasks/${taskId}`); }}>👁 View</button>
            <button type="button" className="btn btn-secondary btn-sm" onClick={(e) => { e.stopPropagation(); onEdit(task); }}>✏ Edit</button>
            <button type="button" className="btn btn-danger btn-sm" onClick={(e) => { e.stopPropagation(); onDelete(taskId); }}>🗑 Delete</button>
          </div>
        </div>
      )}
    </div>
  );
}
