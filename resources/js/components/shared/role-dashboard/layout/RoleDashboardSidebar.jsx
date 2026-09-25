import React from "react";
import Icon from "../../../super-admin/Icon.jsx";

const moduleIcon = (module) => {
  const label = module.toLowerCase();

  if (label.includes("user") || label.includes("customer")) {
    return "users";
  }

  if (label.includes("session") || label.includes("activity")) {
    return "clock";
  }

  if (label.includes("role") || label.includes("status")) {
    return "lock";
  }

  if (label.includes("supplier") || label.includes("purchase")) {
    return "truck";
  }

  if (label.includes("sale") || label.includes("order")) {
    return "cart";
  }

  if (label.includes("stock") || label.includes("inventory")) {
    return "package";
  }

  if (label.includes("alert") || label.includes("issue")) {
    return "warning";
  }

  return "chart";
};

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
        <span className="role-dashboard-brand-badge" aria-hidden="true">
          <Icon name="package" size={22} />
        </span>
        <span className="role-dashboard-brand-copy">
          <strong>Walang Brownout</strong>
          <small>{config.title} Portal</small>
        </span>
      </div>

      <nav
        className="role-dashboard-nav"
        aria-label={`${config.title} navigation`}
      >
        <span className="role-dashboard-nav-label">Workspace</span>
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
          <Icon name="home" size={17} />
          <span>Overview</span>
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
            <Icon name={moduleIcon(module)} size={17} />
            <span>{module}</span>
          </button>
        ))}
      </nav>

      <button
        type="button"
        className="role-dashboard-logout"
        onClick={handleExit}
      >
        <Icon name="logout" size={17} />
        {previewMode
          ? "Exit preview"
          : "Sign out"}
      </button>
    </aside>
  );
}
