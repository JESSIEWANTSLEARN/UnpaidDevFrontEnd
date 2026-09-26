import React, { useMemo, useState } from "react";
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
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");

  const baseRows = useMemo(
    () =>
      approvalsOnly
        ? purchaseOrders.filter((po) => po.status === "PENDING_APPROVAL")
        : purchaseOrders,
    [purchaseOrders, approvalsOnly]
  );

  const statuses = useMemo(
    () => [...new Set(baseRows.map((po) => po.status).filter(Boolean))].sort(),
    [baseRows]
  );

  const rows = useMemo(() => {
    const needle = search.trim().toLowerCase();

    return baseRows.filter((po) => {
      const statusMatch =
        approvalsOnly || status === "all" || po.status === status;

      const searchMatch =
        !needle ||
        [
          po.po_id,
          po.po_number,
          po.supplier_name,
          po.product_name,
          po.status,
          po.created_by,
          po.created_by_user_id,
          po.approved_by,
        ].some((value) =>
          String(value ?? "").toLowerCase().includes(needle)
        );

      return statusMatch && searchMatch;
    });
  }, [baseRows, search, status, approvalsOnly]);

  if (!baseRows.length) {
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
    <>
      <div className="role-live-filter-bar">
        <div className="role-live-search-wrap">
          <input
            className="role-live-search-input"
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search PO, supplier, product, creator..."
            aria-label="Search purchase orders"
          />
          {search && (
            <button
              className="role-live-search-clear"
              type="button"
              onClick={() => setSearch("")}
            >
              Clear
            </button>
          )}
        </div>

        {!approvalsOnly && (
          <select
            className="role-live-filter-select"
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            aria-label="Filter purchase orders by status"
          >
            <option value="all">All Statuses</option>
            {statuses.map((poStatus) => (
              <option key={poStatus} value={poStatus}>
                {poStatus}
              </option>
            ))}
          </select>
        )}
      </div>

      {rows.length === 0 ? (
        <Empty text="No purchase orders match your filters." />
      ) : (
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
                  <td>{po.product_name || "-"}</td>
                  <td>{number(po.quantity_ordered)}</td>
                  <td>{number(po.quantity_received)}</td>
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
      )}
    </>
  );
}