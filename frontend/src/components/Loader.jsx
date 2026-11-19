// src/components/Loader.jsx
export default function Loader({ label = 'Loading…', fullPage = true }) {
  if (fullPage) {
    return (
      <div className="spinner-page">
        <div className="spinner" />
        <p className="spinner-label">{label}</p>
      </div>
    );
  }
  return <div className="spinner spinner-sm" />;
}
