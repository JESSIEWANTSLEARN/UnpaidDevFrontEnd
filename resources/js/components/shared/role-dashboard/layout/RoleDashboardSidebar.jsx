import React from "react";

export default function RoleDashboardSidebar({
  config,
  activeModule,
  onModuleChange,
  previewMode,
  onExitPreview,
  onLogout,
}) {
  const handleExit = previewMode
    ? onExitPreview
    : onLogout;

  return (
    <aside className="role-dashboard-sidebar">
      <div className="role-dashboard-brand">
        <strong>WalangBrownOut</strong>
        <span>{config.title}</span>
      </div>

      <nav
        className="role-dashboard-nav"
        aria-label={`${config.title} navigation`}
      >
        <button
          type="button"
          className={
            activeModule === "Overview"
              ? "is-active"
              : ""
          }
          onClick={() =>
            onModuleChange("Overview")
          }
        >
          Overview
        </button>

        {config.modules.map((module) => (
          <button
            key={module}
            type="button"
            className={
              activeModule === module
                ? "is-active"
                : ""
            }
            onClick={() =>
              onModuleChange(module)
            }
          >
            {module}
          </button>
        ))}
      </nav>

      <button
        type="button"
        className="role-dashboard-logout"
        onClick={handleExit}
      >
        {previewMode
          ? "Exit preview"
          : "Sign out"}
      </button>
    </aside>
  );
}
