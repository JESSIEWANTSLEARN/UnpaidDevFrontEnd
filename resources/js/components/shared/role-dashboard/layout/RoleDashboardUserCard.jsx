import React from "react";

export default function RoleDashboardUserCard({
  theme,
  onToggleTheme,
  userName,
  roleLabel,
}) {
  return (
    <div className="role-dashboard-user">
      <button
        type="button"
        className="role-dashboard-theme-toggle"
        onClick={onToggleTheme}
        aria-label={
          theme === "dark"
            ? "Switch to light mode"
            : "Switch to dark mode"
        }
        title={
          theme === "dark"
            ? "Light mode"
            : "Dark mode"
        }
      >
        {theme === "dark" ? "\u2600" : "\u263E"}
      </button>

      <strong>{userName}</strong>
      <small>{roleLabel}</small>
    </div>
  );
}
