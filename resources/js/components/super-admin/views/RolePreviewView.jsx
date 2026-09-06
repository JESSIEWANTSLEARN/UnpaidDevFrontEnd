import React from "react";
import { ROLE_DASHBOARDS } from "../../../config/roleDashboardConfig.js";
import "../../../../css/super-admin/role-preview.css";

/*
 * Super Admin role preview launcher.
 *
 * Previewing never changes the authenticated user's role. Each staff preview
 * opens through a Super Admin-only route and remains read-only.
 */
export default function RolePreviewView({ theme = "light" }) {
  const entries = Object.entries(ROLE_DASHBOARDS);

  const openPreview = (roleKey) => {
    window.location.href =
      `/super-admin/role-preview/${encodeURIComponent(roleKey)}`;
  };

  return (
    <section className="role-preview-picker" data-theme={theme}>
      <div className="role-preview-picker-heading">
        <div>
          <span className="role-preview-kicker">Super Admin Tool</span>
          <h2>View as Role</h2>
          <p>
            Inspect each staff workspace without changing your account role or
            signing in as another user.
          </p>
        </div>

        <div className="role-preview-readonly">
          <strong>Read-only preview</strong>
          <span>Actual role stays Super Admin</span>
        </div>
      </div>

      <div className="role-preview-picker-grid">
        {entries.map(([roleKey, role]) => (
          <button
            type="button"
            className="role-preview-picker-card"
            key={roleKey}
            onClick={() => openPreview(roleKey)}
          >
            <span className="role-preview-role-code">{roleKey}</span>
            <strong>{role.title}</strong>
            <p>{role.subtitle}</p>
            <span className="role-preview-open">Open preview</span>
          </button>
        ))}

        <button
          type="button"
          className="role-preview-picker-card"
          onClick={() => {
            window.location.href = "/store-preview";
          }}
        >
          <span className="role-preview-role-code">System_User</span>
          <strong>System User</strong>
          <p>Preview the existing customer store experience.</p>
          <span className="role-preview-open">Open customer preview</span>
        </button>
      </div>
    </section>
  );
}