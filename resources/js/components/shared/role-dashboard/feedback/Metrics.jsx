import React from "react";
import Icon from "../../../super-admin/Icon.jsx";
import { number } from "../utils/formatters.js";

export default function Metrics({
  metrics = {},
  roleKey,
}) {
  const base = [
    ["Products", metrics.total_products, "package"],
    ["Available Stock", metrics.total_stock, "warehouse"],
    ["Low Stock", metrics.low_stock_items, "warning"],
    ["Out of Stock", metrics.out_of_stock, "close-circle"],
    ["Open POs", metrics.open_purchase_orders, "cart"],
  ];

  const purchasing = [
    [
      "Awaiting Approval",
      metrics.pending_approval_pos,
      "clock",
    ],
    ["Ordered POs", metrics.ordered_pos, "cart"],
    [
      "Active Suppliers",
      metrics.active_suppliers,
      "truck",
    ],
    [
      "Reorder Needs",
      metrics.reorder_needs,
      "refresh",
    ],
  ];

  const operations = [
    ["Pending Orders", metrics.pending_orders, "clock"],
    [
      "Movements Today",
      metrics.stock_movements_today,
      "chart",
    ],
    ["Receipts Today", metrics.receipts_today, "package"],
    ["Expiry Watch", metrics.expiring_batches, "warning"],
  ];

  const cards =
    roleKey === "Purchasing_Manager" ||
    roleKey === "Purchasing_Staff"
      ? [...base, ...purchasing]
      : [...base, ...operations];

  return (
    <div className="role-live-metrics">
      {cards.map(([label, value, icon]) => (
        <article
          className="role-live-metric"
          key={label}
        >
          <span className="role-live-metric-icon" aria-hidden="true">
            <Icon name={icon} size={17} />
          </span>
          <span>{label}</span>
          <strong>{number(value)}</strong>
        </article>
      ))}
    </div>
  );
}
