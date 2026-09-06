// Sales Staff route wrapper using the shared staff dashboard shell.
import React from "react";
import RoleDashboardShell from "../../components/shared/role-dashboard/RoleDashboardShell.jsx";
export default function SalesStaff() {
  return <RoleDashboardShell roleKey="Sales_Staff" />;
}