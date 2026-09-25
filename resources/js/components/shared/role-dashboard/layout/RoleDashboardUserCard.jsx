import React, { useState } from "react";
import Icon from "../../../super-admin/Icon.jsx";

export default function RoleDashboardUserCard({
  theme,
  onToggleTheme,
  onRefresh,
  userName,
  roleLabel,
}) {
  const [activePanel, setActivePanel] = useState("");

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
        className="role-dashboard-header-icon"
        onClick={() =>
          setActivePanel((current) =>
            current === "messages" ? "" : "messages",
          )
        }
        aria-label="Messages"
        aria-expanded={activePanel === "messages"}
        title="Messages"
      >
        <Icon name="message" size={16} />
      </button>

      <button
        type="button"
        className="role-dashboard-header-icon"
        onClick={onRefresh}
        aria-label="Refresh dashboard data"
        title="Refresh dashboard data"
      >
        <Icon name="refresh" size={16} />
      </button>

      <button
        type="button"
        className="role-dashboard-header-icon"
        onClick={() =>
          setActivePanel((current) =>
            current === "notifications" ? "" : "notifications",
          )
        }
        aria-label="Notifications"
        aria-expanded={activePanel === "notifications"}
        title="Notifications"
      >
        <Icon name="bell" size={16} />
      </button>

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
        <Icon
          name={theme === "dark" ? "sun" : "moon"}
          size={16}
        />
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

      {activePanel && (
        <section
          className="role-dashboard-header-popover"
          role="dialog"
          aria-label={
            activePanel === "messages"
              ? "Messages"
              : "Notifications"
          }
        >
          <div className="role-dashboard-header-popover-head">
            <strong>
              {activePanel === "messages"
                ? "Messages"
                : "Notifications"}
            </strong>
            <button
              type="button"
              onClick={() => setActivePanel("")}
              aria-label={`Close ${activePanel}`}
            >
              ×
            </button>
          </div>
          <p>
            {activePanel === "messages"
              ? "No staff messages are available."
              : "No staff notifications are available."}
          </p>
        </section>
      )}
    </div>
  );
}
