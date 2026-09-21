import React from "react";
import { number } from "../utils/formatters.js";

export default function Metrics({
  metrics = {},
  roleKey,
}) {
  const base = [
    ["Products", metrics.total_products],
    ["Available Stock", metrics.total_stock],
    ["Low Stock", metrics.low_stock_items],
    ["Out of Stock", metrics.out_of_stock],
    ["Open POs", metrics.open_purchase_orders],
  ];

  const purchasing = [
    [
      "Awaiting Approval",
      metrics.pending_approval_pos,
    ],
    ["Ordered POs", metrics.ordered_pos],
    [
      "Active Suppliers",
      metrics.active_suppliers,
    ],
    [
      "Reorder Needs",
      metrics.reorder_needs,
    ],
  ];

  const operations = [
    ["Pending Orders", metrics.pending_orders],
    [
      "Movements Today",
      metrics.stock_movements_today,
    ],
    ["Receipts Today", metrics.receipts_today],
    ["Expiry Watch", metrics.expiring_batches],
  ];

  const cards =
    roleKey === "Purchasing_Manager" ||
    roleKey === "Purchasing_Staff"
      ? [...base, ...purchasing]
      : [...base, ...operations];

  return (
    <div className="role-live-metrics">
      {cards.map(([label, value]) => (
        <article
          className="role-live-metric"
          key={label}
        >
          <span>{label}</span>
          <strong>{number(value)}</strong>
        </article>
      ))}
    </div>
  );
}
