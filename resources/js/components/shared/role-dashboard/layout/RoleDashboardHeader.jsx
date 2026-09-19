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
      <div>
        <span>
          {previewMode
            ? "Role Preview"
            : "Role Workspace"}
        </span>
        <h1>{title}</h1>
        <p>{config.subtitle}</p>
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
