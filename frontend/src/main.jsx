import React, { Component, StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error("React Error Boundary:", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 40, background: '#0a0b0f', color: '#f87171', minHeight: '100vh', fontFamily: 'monospace' }}>
          <h2>⚠️ Component Render Error:</h2>
          <pre style={{ whiteSpace: 'pre-wrap', background: '#16181f', padding: 20, borderRadius: 8, color: '#f1f3f9' }}>
            {this.state.error?.stack || String(this.state.error)}
          </pre>
          <button 
            onClick={() => { localStorage.clear(); window.location.href = '/login'; }}
            style={{ padding: '10px 20px', background: '#6c63ff', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', marginTop: 16, fontWeight: 'bold' }}>
            🔄 Clear Cache & Go to Login
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)
