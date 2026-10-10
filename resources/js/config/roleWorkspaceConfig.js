// Presentation only: server-side role permissions remain authoritative.
export const ROLE_WORKSPACES = {
  Operations_Manager: {
    legacy: "Operational Overview",
    title: "Operational Monitoring",
    description:
      "Triage stock shortages, pending sales, and purchasing handoffs in one queue.",
  },
  Purchasing_Manager: {
    legacy: "Purchasing Overview",
    title: "Procurement Planning",
    description:
      "Compare replenishment needs with incoming purchase quantities by supplier.",
  },
  Purchasing_Staff: {
    legacy: "Purchasing Tasks",
    title: "Purchasing Tasks",
    description:
      "Follow your draft submissions, approvals, and outstanding supplier deliveries.",
  },
  Warehouse_Admin: {
    legacy: "Warehouse Overview",
    title: "Receiving & Expiry",
    description:
      "Plan outstanding receipts and review stocked batches by expiry window.",
  },
  Inventory_Controller: {
    legacy: "Inventory Overview",
    title: "Stock Investigation",
    description:
      "Inspect a product alongside its recent batches and stock movements.",
  },
  Sales_Manager: {
    legacy: "Sales Overview",
    title: "Sales Analysis",
    description:
      "Analyze order outcomes and fulfilled value for a selected order-date range.",
  },
  Sales_Staff: {
    legacy: "Sales Tasks",
    title: "Fulfillment Queue",
    description:
      "Work through payment checks, ready-to-process orders, and fulfillment.",
  },
  User_Admin: {
    legacy: "User Overview",
    title: "Account Review",
    description:
      "Review unverified accounts, inactive access, and multiple active sessions.",
  },
};

export const MODULE_PURPOSES = {
  "Inventory Health": "Check available stock and replenishment thresholds.",
  "Data Imports": "Validate and import the data allowed for this role.",
  "Purchase Activity": "Inspect recent procurement and receiving progress.",
  "Sales Activity": "Inspect recent customer order status and value.",
  "Operational Alerts": "Review current operational exceptions.",
  Suppliers: "Maintain supplier contacts and inspect linked products.",
  "Supplier Returns": "Review the supplier return workflow.",
  "Purchase Orders": "Prepare purchase orders and follow their status.",
  "Reorder Needs": "Review products needing replenishment.",
  Approvals: "Review purchase orders awaiting manager approval.",
  "Reorder Requests": "Identify products for purchase-order preparation.",
  Receiving: "Record purchase-order deliveries and manual stock receipts.",
  "Returned Items": "Review returned items in the warehouse workflow.",
  "Batch Tracking": "Inspect batch quantities, receipt dates, and expiry.",
  "Stock Movement": "Inspect the inventory transaction history.",
  "Warehouse Issues": "Review warehouse stock and expiry alerts.",
  "Return Inspection": "Inspect returned stock in the return workflow.",
  "Stock In": "Record a new inventory batch.",
  Adjustments: "Correct batch quantities with an audit record.",
  "Write Offs": "Record damaged, missing, or expired stock.",
  "Low Stock": "Review products at or below their reorder threshold.",
  Orders: "Review orders, payments, and fulfillment actions.",
  Customers: "Inspect customer contacts and sales history.",
  "Returns & Refunds": "Review returns and refund processing.",
  "Customer Support": "Handle customer conversations and support requests.",
  "Product Performance": "Compare fulfilled units and revenue by product.",
  "Sales Alerts": "Review order backlog and fulfillment risks.",
  "Product Availability": "Check the current stock available for sale.",
  "User Accounts": "Create and maintain manageable user accounts.",
  "Roles & Status": "Review account roles and activation status.",
  Sessions: "Inspect tracked sessions and manage access.",
  "Access Activity": "Review recent account and session audit events.",
};

export function resolveRoleModule(roleKey, saved, modules) {
  const workspace = ROLE_WORKSPACES[roleKey];
  const candidate = saved === workspace?.legacy ? workspace.title : saved;
  return ["Overview", ...modules].includes(candidate) ? candidate : "Overview";
}
