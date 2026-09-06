import React from "react";
import { useParams } from "react-router-dom";
import RoleDashboardShell from "../../components/shared/role-dashboard/RoleDashboardShell.jsx";
import { ROLE_DASHBOARDS } from "../../config/roleDashboardConfig.js";

export default function RolePreview() {
  const { roleKey } = useParams();

  if (!ROLE_DASHBOARDS[roleKey]) {
    return (
      <main className="role-dashboard-state">
        This role preview does not exist.
      </main>
    );
  }

  return <RoleDashboardShell roleKey={roleKey} previewMode />;
}