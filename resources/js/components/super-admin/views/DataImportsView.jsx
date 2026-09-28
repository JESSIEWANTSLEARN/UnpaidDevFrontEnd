import React from "react";
import DataImportsPanel from "../../shared/imports/DataImportsPanel.jsx";

export default function DataImportsView({
  onDashboardRefresh,
}) {
  return (
    <DataImportsPanel
      roleKey="super_admin"
      onDashboardRefresh={onDashboardRefresh}
    />
  );
}
