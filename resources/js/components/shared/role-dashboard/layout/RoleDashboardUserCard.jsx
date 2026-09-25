import React from "react";

export default function RoleDashboardUserCard({
  theme,
  onToggleTheme,
  userName,
  roleLabel,
}) {
  const initials = String(userName || "User")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join("")
    .toUpperCase();

  return (
    <div className="role-dashboard-header-actions">
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

      <div className="role-dashboard-user">
        <span
          className="role-dashboard-user-avatar"
          aria-hidden="true"
        >
          {initials}
        </span>
        <span className="role-dashboard-user-copy">
          <strong>{userName}</strong>
          <small>{roleLabel}</small>
        </span>
      </div>
    </div>
  );
}
