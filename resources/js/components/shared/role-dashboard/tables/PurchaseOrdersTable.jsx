import React from "react";
import Empty from "../common/Empty.jsx";
import { money, number } from "../utils/formatters.js";

export default function PurchaseOrdersTable({
  purchaseOrders = [],
  roleKey,
  previewMode,
  currentUserId,
  busy,
  onStatus,
  approvalsOnly = false,
}) {
  const rows = approvalsOnly
    ? purchaseOrders.filter(
        (po) =>
          po.status ===
          "PENDING_APPROVAL",
      )
    : purchaseOrders;

  if (!rows.length) {
    return (
      <Empty
        text={
          approvalsOnly
            ? "No purchase orders are awaiting approval."
            : "No purchase orders found."
        }
      />
    );
  }

  const manager =
    roleKey === "Purchasing_Manager";

  const actionsFor = (po) => {
    if (previewMode) return [];

    const actions = [];

    if (po.status === "DRAFT") {
      if (
        manager ||
        Number(po.created_by_user_id) ===
          Number(currentUserId)
      ) {
        actions.push([
          "submit",
          "Submit",
        ]);
      }
    }

    if (
      manager &&
      po.status === "PENDING_APPROVAL"
    ) {
      actions.push([
        "approve",
        "Approve",
      ]);
    }

    if (
      manager &&
      po.status === "APPROVED"
    ) {
      actions.push([
        "order",
        "Mark Ordered",
      ]);
    }

    if (
      manager &&
      ![
        "RECEIVED",
        "PARTIALLY_RECEIVED",
        "CANCELLED",
      ].includes(po.status)
    ) {
      actions.push([
        "cancel",
        "Cancel",
      ]);
    }

    return actions;
  };

  return (
    <div className="role-live-table-wrap">
      <table className="role-live-table">
        <thead>
          <tr>
            <th>PO</th>
            <th>Supplier</th>
            <th>Product</th>
            <th>Ordered</th>
            <th>Received</th>
            <th>Cost</th>
            <th>Status</th>
            <th>Created By</th>
            <th>Approved By</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((po, index) => (
            <tr
              key={`${po.po_id}-${po.po_detail_id || index}`}
            >
              <td>{po.po_number}</td>
              <td>{po.supplier_name}</td>
              <td>
                {po.product_name || "-"}
              </td>
              <td>
                {number(
                  po.quantity_ordered,
                )}
              </td>
              <td>
                {number(
                  po.quantity_received,
                )}
              </td>
              <td>{money(po.unit_cost)}</td>
              <td>{po.status}</td>
              <td>{po.created_by || "-"}</td>
              <td>{po.approved_by || "-"}</td>
              <td>
                <div className="role-live-inline-actions">
                  {previewMode && (
                    <span className="role-live-muted">
                      Read only
                    </span>
                  )}

                  {actionsFor(po).map(
                    ([action, label]) => (
                      <button
                        key={action}
                        type="button"
                        className={
                          action === "cancel"
                            ? "role-live-danger-action"
                            : "role-live-table-action"
                        }
                        disabled={busy}
                        onClick={() =>
                          onStatus(
                            po.po_id,
                            action,
                          )
                        }
                      >
                        {label}
                      </button>
                    ),
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
