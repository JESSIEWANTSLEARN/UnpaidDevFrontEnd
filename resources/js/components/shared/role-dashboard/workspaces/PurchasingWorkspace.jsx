import React, { useState } from "react";
import PurchaseOrdersTable from "../tables/PurchaseOrdersTable.jsx";
import {
  Choice,
  ModuleButton,
  Workspace,
  WorkspaceTable,
} from "./WorkspacePrimitives.jsx";
import {
  list,
  numeric,
  outstanding,
  incoming,
  procurementPlan,
  uniquePOCount,
} from "./workspaceData.js";

export default function PurchasingWorkspace({
  roleKey,
  data,
  previewMode,
  busy,
  onPurchaseOrderStatus,
  onModuleChange,
}) {
  const [supplier, setSupplier] = useState("All");
  const [stage, setStage] = useState("My drafts");
  if (roleKey === "Purchasing_Manager") {
    const plan = procurementPlan(data);
    const rows = plan.filter(
      (p) =>
        supplier === "All" ||
        String(p.supplier_id ?? "unassigned") === supplier,
    );
    const suppliers = [
      ...new Map(
        plan.map((p) => [
          String(p.supplier_id ?? "unassigned"),
          p.supplier_name || "Unassigned supplier",
        ]),
      ).entries(),
    ];
    return (
      <Workspace
        title="Procurement Planning"
        description="Compare the suggested replenishment quantity with quantities still expected from ordered or partially received POs."
        scope="Incoming quantities use up to 100 recent PO lines. Planning gaps are estimates; review all outstanding commitments before creating a purchase order. Drafts and approvals are excluded from incoming stock."
      >
        <div className="role-workspace-controls">
          <Choice
            label="Planning supplier"
            value={supplier}
            onChange={setSupplier}
            options={["All", ...suppliers]}
          />
          <ModuleButton
            module="Purchase Orders"
            onModuleChange={onModuleChange}
          >
            Prepare purchase order
          </ModuleButton>
          <ModuleButton module="Suppliers" onModuleChange={onModuleChange} />
        </div>
        <WorkspaceTable
          headings={[
            "Product",
            "Supplier",
            "Available",
            "Suggested qty",
            "Incoming qty",
            "Planning gap",
          ]}
          rows={rows.map((p) => ({
            key: p.product_id,
            cells: [
              `${p.sku} · ${p.name}`,
              p.supplier_name || "Unassigned",
              numeric(p.available_stock),
              numeric(p.recommended_reorder_quantity),
              p.incomingQuantity,
              p.planningGap,
            ],
          }))}
        />
      </Workspace>
    );
  }
  const rows = list(data.purchase_orders).filter((po) => {
    if (stage === "My drafts")
      return (
        po.status === "DRAFT" &&
        String(po.created_by_user_id) === String(data.current_user_id)
      );
    if (stage === "Awaiting approval") return po.status === "PENDING_APPROVAL";
    if (stage === "Approved for ordering") return po.status === "APPROVED";
    return incoming(po) && outstanding(po) > 0;
  });
  return (
    <Workspace
      title="Purchasing Tasks"
      description="Follow draft submissions and procurement handoffs. Staff can submit their own drafts; approval and ordering remain manager actions."
      scope={
        previewMode
          ? "Preview uses the signed-in Super Admin ID; “My drafts” does not impersonate a staff account. Other queues show shared recent records (up to 100 PO lines)."
          : "Queues use up to 100 recent purchase-order lines. “My drafts” includes only orders created by your account."
      }
    >
      <div className="role-workspace-controls">
        <Choice
          label="Purchasing queue"
          value={stage}
          onChange={setStage}
          options={[
            "My drafts",
            "Awaiting approval",
            "Approved for ordering",
            "Outstanding deliveries",
          ]}
        />
        <span role="status">{uniquePOCount(rows)} purchase orders</span>
        <ModuleButton module="Purchase Orders" onModuleChange={onModuleChange}>
          Prepare purchase order
        </ModuleButton>
      </div>
      <PurchaseOrdersTable
        key={stage}
        purchaseOrders={rows}
        roleKey={roleKey}
        previewMode={previewMode}
        currentUserId={data.current_user_id}
        busy={busy}
        onStatus={onPurchaseOrderStatus}
      />
    </Workspace>
  );
}
