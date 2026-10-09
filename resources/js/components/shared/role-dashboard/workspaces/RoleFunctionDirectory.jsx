import React from "react";
import { ROLE_DASHBOARDS } from "../../../../config/roleDashboardConfig.js";
import {
  MODULE_PURPOSES,
  ROLE_WORKSPACES,
} from "../../../../config/roleWorkspaceConfig.js";
import { list, uniquePOCount } from "./workspaceData.js";
import { Workspace } from "./WorkspacePrimitives.jsx";

function summary(module, data) {
  const collections = {
    "Inventory Health": ["products", "products"],
    Suppliers: ["suppliers", "suppliers"],
    "Reorder Needs": ["reorder_needs", "products needing replenishment"],
    "Reorder Requests": ["reorder_needs", "products needing replenishment"],
    "Batch Tracking": ["batches", "recent batches"],
    "Stock Movement": ["transactions", "recent movements"],
    "Low Stock": ["low_stock_products", "low-stock products"],
    Customers: ["customers", "customers"],
    Orders: ["orders", "recent orders"],
    "Sales Activity": ["orders", "recent orders"],
    "Product Performance": [
      "product_performance",
      "products with fulfilled sales",
    ],
    "Product Availability": ["products", "products"],
    "Operational Alerts": ["alerts", "alerts"],
    "Warehouse Issues": ["alerts", "alerts"],
    "Sales Alerts": ["alerts", "alerts"],
    "User Accounts": ["users", "manageable accounts"],
    "Roles & Status": ["users", "manageable accounts"],
    "Access Activity": ["recent_access", "recent events"],
  };
  const mapping = collections[module];
  if (mapping && Array.isArray(data?.[mapping[0]]))
    return `${data[mapping[0]].length} ${mapping[1]}`;
  if (
    ["Purchase Orders", "Purchase Activity", "Approvals", "Receiving"].includes(
      module,
    ) &&
    Array.isArray(data?.purchase_orders)
  ) {
    const rows = data.purchase_orders.filter((po) =>
      module === "Approvals"
        ? po.status === "PENDING_APPROVAL"
        : module === "Receiving"
          ? ["ORDERED", "PARTIALLY_RECEIVED"].includes(po.status)
          : true,
    );
    return `${uniquePOCount(rows)} purchase orders in loaded records`;
  }
  if (module === "Sessions" && data?.metrics?.active_sessions != null)
    return `${data.metrics.active_sessions} tracked active sessions`;
  if (
    ["Adjustments", "Write Offs"].includes(module) &&
    Array.isArray(data?.transactions)
  )
    return `${list(data.transactions).filter((t) => t.transaction_type === (module === "Adjustments" ? "ADJUSTMENT" : "WRITE_OFF")).length} recent transactions`;
  return "Open workspace to review";
}
export default function RoleFunctionDirectory({
  roleKey,
  data,
  onModuleChange,
}) {
  const config = ROLE_DASHBOARDS[roleKey];
  return (
    <Workspace
      title="Role responsibilities"
      description="Review every function available to this role. Open a workspace for its detailed tools and actions."
      scope="Counts reflect the currently loaded records. Returns, support, and imports load their latest details when opened."
    >
      <div className="role-function-grid">
        {config.modules.map((module) => (
          <button
            type="button"
            className="role-function-card"
            key={module}
            onClick={() => onModuleChange(module)}
          >
            <strong>
              {module}
              <span aria-hidden="true"> →</span>
            </strong>
            <span>
              {module === ROLE_WORKSPACES[roleKey].title
                ? ROLE_WORKSPACES[roleKey].description
                : MODULE_PURPOSES[module]}
            </span>
            <small>{summary(module, data)}</small>
          </button>
        ))}
      </div>
    </Workspace>
  );
}
