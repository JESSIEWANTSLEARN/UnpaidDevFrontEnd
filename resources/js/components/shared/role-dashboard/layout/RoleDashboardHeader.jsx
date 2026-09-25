import React from "react";
import RoleDashboardUserCard from "./RoleDashboardUserCard.jsx";

export default function RoleDashboardHeader({
  config,
  activeModule,
  previewMode,
  theme,
  onToggleTheme,
  userName,
}) {
  const title =
    activeModule === "Overview"
      ? config.title
      : activeModule;

  return (
    <header className="role-dashboard-header">
      <div className="role-dashboard-header-copy">
        <span className="role-dashboard-header-eyebrow">
          {previewMode
            ? "Role Preview"
            : "Role Workspace"}
        </span>
        <h1 className="role-dashboard-header-title">
          {title}
        </h1>
      </div>

      <RoleDashboardUserCard
        theme={theme}
        onToggleTheme={onToggleTheme}
        userName={userName}
        roleLabel={
          previewMode
            ? "Signed in as Super Admin"
            : config.title
        }
      />
    </header>
  );
}
