import { ROLE_WORKSPACES } from "./roleWorkspaceConfig.js";

/*
 * Shared staff-role dashboard configuration.
 * Role keys must match WBO_Users.role exactly.
 * This config controls presentation only; Laravel still enforces authorization.
 */

export const ROLE_DASHBOARDS = {
  Operations_Manager: {
    liveData: true,
    title: "Operations Manager",
    route: "/operations-manager",
    accent: "#7c3aed",
    accentRgb: "124 58 237",
    subtitle:
      "Coordinate purchasing, inventory, sales, and operational issues.",
    modules: [
      ROLE_WORKSPACES.Operations_Manager.title,
      "Inventory Health",
      "Purchase Activity",
      "Sales Activity",
      "Operational Alerts",
    ],
  },

  Purchasing_Manager: {
    liveData: true,
    title: "Purchasing Manager",
    route: "/purchasing-manager",
    accent: "#0d9488",
    accentRgb: "13 148 136",
    subtitle:
      "Manage suppliers, purchase orders, approvals, and replenishment.",
    modules: [
      ROLE_WORKSPACES.Purchasing_Manager.title,
      "Suppliers",
      "Purchase Orders",
      "Reorder Needs",
      "Approvals",
    ],
  },

  Purchasing_Staff: {
    liveData: true,
    title: "Purchasing Staff",
    route: "/purchasing-staff",
    accent: "#0d9488",
    accentRgb: "13 148 136",
    subtitle:
      "Handle supplier records and day-to-day purchase-order work.",
    modules: [
      ROLE_WORKSPACES.Purchasing_Staff.title,
      "Suppliers",
      "Purchase Orders",
      "Reorder Requests",
    ],
  },

  Warehouse_Admin: {
    liveData: true,
    title: "Warehouse Admin",
    route: "/warehouse-admin",
    accent: "#d97706",
    accentRgb: "217 119 6",
    subtitle:
      "Supervise receiving, stock, batches, and warehouse accuracy.",
    modules: [
      ROLE_WORKSPACES.Warehouse_Admin.title,
      "Receiving",
      "Batch Tracking",
      "Stock Movement",
      "Warehouse Issues",
    ],
  },

  Inventory_Controller: {
    liveData: true,
    title: "Inventory Controller",
    route: "/inventory-controller",
    accent: "#2563eb",
    accentRgb: "37 99 235",
    subtitle:
      "Control stock records, movements, adjustments, and low-stock monitoring.",
    modules: [
      ROLE_WORKSPACES.Inventory_Controller.title,
      "Stock Movement",
      "Stock In",
      "Adjustments",
      "Write Offs",
      "Low Stock",
    ],
  },

  Sales_Manager: {
    liveData: true,
    title: "Sales Manager",
    route: "/sales-manager",
    accent: "#059669",
    accentRgb: "5 150 105",
    subtitle:
      "Monitor sales, orders, customers, and product performance.",
    modules: [
      ROLE_WORKSPACES.Sales_Manager.title,
      "Orders",
      "Customers",
      "Customer Support",
      "Product Performance",
      "Sales Alerts",
    ],
  },

  Sales_Staff: {
    liveData: true,
    title: "Sales Staff",
    route: "/sales-staff",
    accent: "#059669",
    accentRgb: "5 150 105",
    subtitle:
      "Support customer orders and daily sales activity.",
    modules: [
      ROLE_WORKSPACES.Sales_Staff.title,
      "Orders",
      "Customers",
      "Customer Support",
      "Product Availability",
    ],
  },

  User_Admin: {
    title: "User Admin",
    route: "/user-admin",
    accent: "#4f46e5",
    accentRgb: "79 70 229",
    subtitle:
      "Manage user accounts, roles, account status, and session access.",
    modules: [
      ROLE_WORKSPACES.User_Admin.title,
      "User Accounts",
      "Roles & Status",
      "Sessions",
      "Access Activity",
    ],
  },
};

export const routeForRole = (role) =>
  ROLE_DASHBOARDS[role]?.route || "/login";
