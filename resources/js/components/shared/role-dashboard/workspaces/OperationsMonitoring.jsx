import React, { useState } from "react";
import { list, numeric, outstanding, incoming } from "./workspaceData.js";
import {
  Choice,
  ModuleButton,
  Workspace,
  WorkspaceTable,
} from "./WorkspacePrimitives.jsx";

export default function OperationsMonitoring({ data, onModuleChange }) {
  const [area, setArea] = useState("All");
  const rows = [
    ...list(data.products)
      .filter((p) => numeric(p.available_stock) <= numeric(p.reorder_point))
      .map((p) => ({
        key: `product-${p.product_id}`,
        area: "Inventory",
        record: p.name,
        condition:
          numeric(p.available_stock) <= 0
            ? "Out of stock"
            : "Reorder threshold reached",
        detail: `${p.available_stock} available · reorder point ${p.reorder_point}`,
        module: "Inventory Health",
      })),
    ...list(data.purchase_orders)
      .filter(
        (po) =>
          ["PENDING_APPROVAL", "APPROVED"].includes(po.status) ||
          (incoming(po) && outstanding(po) > 0),
      )
      .map((po, i) => ({
        key: `po-${po.po_id}-${po.po_detail_id || i}`,
        area: "Purchasing",
        record: `${po.po_number} · ${po.product_name || "No product"}`,
        condition: po.status.replaceAll("_", " "),
        detail: incoming(po)
          ? `${outstanding(po)} units still to receive`
          : "Purchasing Manager follow-up",
        module: "Purchase Activity",
      })),
    ...list(data.orders)
      .filter((o) => ["PENDING", "PROCESSING"].includes(o.status))
      .map((o) => ({
        key: `order-${o.order_id}`,
        area: "Sales",
        record: `Order #${o.order_id}`,
        condition: o.status,
        detail:
          o.status === "PENDING"
            ? "Sales review needed"
            : "Awaiting fulfillment",
        module: "Sales Activity",
      })),
  ];
  const filtered = rows.filter((row) => area === "All" || row.area === area);
  return (
    <Workspace
      title="Operational Monitoring"
      description="Triage handoffs across inventory, purchasing, and sales. Use the linked workspace to inspect each record."
      scope="Uses current products, up to 100 recent purchase-order lines, and 50 recent sales orders. These are follow-up conditions, not confirmed delays."
    >
      <div className="role-workspace-controls">
        <Choice
          label="Operational area"
          value={area}
          onChange={setArea}
          options={["All", "Inventory", "Purchasing", "Sales"]}
        />
        <span role="status">{filtered.length} follow-up records</span>
      </div>
      <WorkspaceTable
        headings={["Area", "Record", "Condition", "Follow-up", "Workspace"]}
        rows={filtered.map((row) => ({
          key: row.key,
          cells: [
            row.area,
            row.record,
            row.condition,
            row.detail,
            <ModuleButton
              module={row.module}
              onModuleChange={onModuleChange}
            />,
          ],
        }))}
      />
    </Workspace>
  );
}
