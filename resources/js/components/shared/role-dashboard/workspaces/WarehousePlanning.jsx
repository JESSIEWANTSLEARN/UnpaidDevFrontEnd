import React, { useState } from "react";
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
  expiryGroup,
} from "./workspaceData.js";

export default function WarehousePlanning({ data, onModuleChange }) {
  const [window, setWindow] = useState("Within 30 days");
  const receipts = list(data.purchase_orders).filter(
    (po) => incoming(po) && outstanding(po) > 0,
  );
  const batches = list(data.batches)
    .filter((b) => numeric(b.current_quantity) > 0)
    .map((b) => ({ ...b, group: expiryGroup(b) }))
    .filter(
      (b) =>
        window === "All stocked batches" ||
        (window === "Within 30 days"
          ? ["Within 7 days", "8–30 days"].includes(b.group)
          : b.group === window),
    )
    .sort((a, b) =>
      String(a.expiry_date || "9999").localeCompare(
        String(b.expiry_date || "9999"),
      ),
    );
  return (
    <>
      <Workspace
        title="Receiving & Expiry"
        description="Plan outstanding deliveries and prioritize batches by expiry date."
        scope="Uses up to 100 recent PO lines and 100 recent batches. Expiry windows use the Asia/Manila calendar date; older records may be outside this view."
      >
        <div className="role-workspace-controls">
          <ModuleButton module="Receiving" onModuleChange={onModuleChange}>
            Record delivery
          </ModuleButton>
        </div>
        <WorkspaceTable
          headings={[
            "PO",
            "Supplier",
            "Product",
            "Ordered",
            "Received",
            "Remaining",
          ]}
          rows={receipts.map((po, i) => ({
            key: `${po.po_id}-${po.po_detail_id || i}`,
            cells: [
              po.po_number,
              po.supplier_name,
              po.product_name,
              numeric(po.quantity_ordered),
              numeric(po.quantity_received),
              outstanding(po),
            ],
          }))}
          empty="No outstanding deliveries in the loaded PO lines."
        />
      </Workspace>
      <Workspace
        title="Batch expiry plan"
        description="Review stocked batches in the selected window, earliest expiry first. No expiry date is shown separately for review."
      >
        <div className="role-workspace-controls">
          <Choice
            label="Expiry window"
            value={window}
            onChange={setWindow}
            options={[
              "Within 30 days",
              "Within 7 days",
              "8–30 days",
              "Expired",
              "No expiry date",
              "Invalid date",
              "All stocked batches",
            ]}
          />
          <ModuleButton
            module="Batch Tracking"
            onModuleChange={onModuleChange}
          />
        </div>
        <WorkspaceTable
          headings={["Batch", "Product", "Current units", "Expiry", "Window"]}
          rows={batches.map((b) => ({
            key: b.batch_id,
            cells: [
              b.batch_number,
              b.product_name,
              b.current_quantity,
              b.expiry_date || "Not recorded",
              b.group,
            ],
          }))}
        />
      </Workspace>
    </>
  );
}
