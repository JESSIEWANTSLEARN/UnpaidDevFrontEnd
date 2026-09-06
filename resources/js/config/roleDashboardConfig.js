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
    subtitle: "Coordinate purchasing, inventory, sales, and operational issues.",
    modules: ["Operational Overview", "Inventory Health", "Purchase Activity", "Sales Activity", "Operational Alerts"],
  },
  Purchasing_Manager: {
    liveData: true,
    title: "Purchasing Manager",
    route: "/purchasing-manager",
    subtitle: "Manage suppliers, purchase orders, approvals, and replenishment.",
    modules: ["Purchasing Overview", "Suppliers", "Purchase Orders", "Reorder Needs", "Approvals"],
  },
  Warehouse_Admin: {
    liveData: true,
    title: "Warehouse Admin",
    route: "/warehouse-admin",
    subtitle: "Supervise receiving, stock, batches, and warehouse accuracy.",
    modules: ["Warehouse Overview", "Receiving", "Batch Tracking", "Stock Movement", "Warehouse Issues"],
  },
  Sales_Manager: {
    liveData: true,
    title: "Sales Manager",
    route: "/sales-manager",
    subtitle: "Monitor sales, orders, customers, and product performance.",
    modules: ["Sales Overview", "Orders", "Customers", "Product Performance", "Sales Alerts"],
  },
  Purchasing_Staff: {
    liveData: true,
    title: "Purchasing Staff",
    route: "/purchasing-staff",
    subtitle: "Handle supplier records and day-to-day purchase-order work.",
    modules: ["Purchasing Tasks", "Suppliers", "Purchase Orders", "Reorder Requests"],
  },
  Inventory_Controller: {
    liveData: true,
    title: "Inventory Controller",
    route: "/inventory-controller",
    subtitle: "Control stock records, movements, adjustments, and low-stock monitoring.",
    modules: ["Inventory Overview", "Stock Movement", "Stock In", "Adjustments", "Low Stock"],
  },
  Sales_Staff: {
    liveData: true,
    title: "Sales Staff",
    route: "/sales-staff",
    subtitle: "Support customer orders and daily sales activity.",
    modules: ["Sales Tasks", "Orders", "Customers", "Product Availability"],
  },
  User_Admin: {
    title: "User Admin",
    route: "/user-admin",
    subtitle: "Manage user accounts, roles, account status, and session access.",
    modules: ["User Overview", "User Accounts", "Roles & Status", "Sessions", "Access Activity"],
  },
};

export const routeForRole = (role) =>
  ROLE_DASHBOARDS[role]?.route || "/login";