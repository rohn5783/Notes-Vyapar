// src/app/notes/loading.jsx
export default function Loading() {
  return (
    <div className="notes-loading-shell">
      <div className="notes-loading-header">
        <div className="notes-loading-bar notes-loading-bar--large" />
        <div className="notes-loading-bar notes-loading-bar--medium" />
      </div>

      <div className="notes-loading-panel">
        <div className="notes-loading-bar notes-loading-bar--input" />
        <div className="notes-loading-bar notes-loading-bar--button-group" />
      </div>

      <div className="notes-loading-grid">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="notes-loading-card">
            <div className="notes-loading-row">
              <div className="notes-loading-bar notes-loading-bar--sm" />
              <div className="notes-loading-bar notes-loading-bar--sm" />
            </div>
            <div className="notes-loading-bar notes-loading-bar--full" />
            <div className="notes-loading-bar notes-loading-bar--large" />
            <div className="notes-loading-divider" />
            <div className="notes-loading-row notes-loading-row--tight">
              <div className="notes-loading-bar notes-loading-bar--sm" />
              <div className="notes-loading-bar notes-loading-bar--sm" />
            </div>
            <div className="notes-loading-bar notes-loading-bar--button" />
          </div>
        ))}
      </div>
    </div>
  );
}
