// Sales Manager route wrapper using the shared staff dashboard shell.
import React from "react";
import RoleDashboardShell from "../../components/shared/role-dashboard/RoleDashboardShell.jsx";
export default function SalesManager() {
  return <RoleDashboardShell roleKey="Sales_Manager" />;
}