// src/components/Alert.jsx
import { useState } from 'react';

const CONFIG = {
  success: { icon: '✓', cls: 'alert-success', title: 'Success' },
  error:   { icon: '✕', cls: 'alert-error',   title: 'Error'   },
  info:    { icon: 'ℹ', cls: 'alert-info',    title: 'Info'    },
  warning: { icon: '⚠', cls: 'alert-warning', title: 'Warning' },
};

export default function Alert({ type = 'info', message, title, dismissible = true, onDismiss }) {
  const [visible, setVisible] = useState(true);
  const cfg = CONFIG[type] || CONFIG.info;

  if (!visible || !message) return null;

  const dismiss = () => { setVisible(false); onDismiss?.(); };

  return (
    <div className={`alert ${cfg.cls} animate-slideUp`}>
      <span className="alert-icon">{cfg.icon}</span>
      <div className="alert-content">
        {(title || cfg.title) && <div className="alert-title">{title || cfg.title}</div>}
        <div className="alert-msg">{message}</div>
      </div>
      {dismissible && (
        <button onClick={dismiss} style={{ marginLeft: 'auto', opacity: 0.7, fontSize: 16, padding: '0 4px' }}>✕</button>
      )}
    </div>
  );
}
