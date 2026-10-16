import React from "react";
import "../../../css/shared/dashboard-loading-skeleton.css";

function SkeletonBlock({ className = "" }) {
  return <span className={`dashboard-skeleton-block ${className}`} aria-hidden="true" />;
}

function DashboardContentPlaceholder() {
  return (
    <div className="dashboard-skeleton-content" aria-hidden="true">
      <div className="dashboard-skeleton-title-row">
        <div className="dashboard-skeleton-title-copy">
          <SkeletonBlock className="is-title" />
          <SkeletonBlock className="is-description" />
        </div>
        <SkeletonBlock className="is-action" />
      </div>

      <div className="dashboard-skeleton-metrics">
        {Array.from({ length: 4 }, (_, index) => (
          <div className="dashboard-skeleton-card" key={index}>
            <SkeletonBlock className="is-metric-label" />
            <SkeletonBlock className="is-metric-value" />
          </div>
        ))}
      </div>

      <div className="dashboard-skeleton-panel">
        <div className="dashboard-skeleton-panel-head">
          <SkeletonBlock className="is-panel-title" />
          <SkeletonBlock className="is-filter" />
        </div>
        <div className="dashboard-skeleton-table-head">
          {Array.from({ length: 5 }, (_, index) => (
            <SkeletonBlock className="is-cell" key={index} />
          ))}
        </div>
        {Array.from({ length: 5 }, (_, row) => (
          <div className="dashboard-skeleton-table-row" key={row}>
            {Array.from({ length: 5 }, (_, column) => (
              <SkeletonBlock className="is-cell" key={column} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function DashboardLoadingSkeleton({
  label = "Loading dashboard...",
  theme = "light",
  fullPage = false,
}) {
  const content = <DashboardContentPlaceholder />;

  if (!fullPage) {
    return (
      <section
        className="dashboard-loading dashboard-loading-content"
        data-theme={theme}
        role="status"
        aria-live="polite"
        aria-busy="true"
      >
        <span className="dashboard-loading-label">{label}</span>
        {content}
      </section>
    );
  }

  return (
    <main
      className="dashboard-loading dashboard-loading-page"
      data-theme={theme}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <span className="dashboard-loading-label">{label}</span>
      <div className="dashboard-skeleton-layout" aria-hidden="true">
        <aside className="dashboard-skeleton-sidebar">
          <SkeletonBlock className="is-brand" />
          {Array.from({ length: 7 }, (_, index) => (
            <SkeletonBlock className="is-nav-item" key={index} />
          ))}
        </aside>
        <div className="dashboard-skeleton-main">{content}</div>
      </div>
    </main>
  );
}
