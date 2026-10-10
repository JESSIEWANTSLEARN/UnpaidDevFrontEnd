import React, { useEffect, useMemo, useState } from "react";
import { csrfFetch } from "../../../config/api.js";
import "../../../../css/sales/returns.css";

const DISPOSITIONS = [
  ["RESTOCK", "Restock"],
  ["QUARANTINE", "Quarantine"],
  ["WRITE_OFF", "Write Off"],
  ["RETURN_TO_SUPPLIER", "Return to Supplier"],
];

const SALES_ROLES = new Set([
  "Sales_Manager",
  "Sales_Staff",
]);

const PURCHASING_ROLES = new Set([
  "Purchasing_Manager",
  "Purchasing_Staff",
]);

function label(value) {
  return String(value || "")
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

async function request(url, options = {}) {
  const response = await csrfFetch(url, {
    method: options.method || "GET",
    headers: {
      Accept: "application/json",
      ...(options.body
        ? { "Content-Type": "application/json" }
        : {}),
    },
    body: options.body
      ? JSON.stringify(options.body)
      : undefined,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok || data.success === false) {
    throw new Error(
      data.message || "Return request failed.",
    );
  }

  return data;
}

function roleHelp(roleKey) {
  if (SALES_ROLES.has(roleKey)) {
    return "Sales reviews return requests and completes customer refunds after warehouse receiving and inventory inspection.";
  }

  if (roleKey === "Warehouse_Admin") {
    return "Warehouse confirms that an approved returned item was physically received before inspection.";
  }

  if (roleKey === "Inventory_Controller") {
    return "Inventory Controller inspects returned items and decides whether they are restocked, quarantined, written off, or returned to the supplier.";
  }

  if (PURCHASING_ROLES.has(roleKey)) {
    return "Purchasing follows returned items that Inventory Controller marked Return to Supplier.";
  }

  return "Return workflow supervision.";
}

export default function ReturnWorkflowPanel({
  roleKey,
  previewMode = false,
}) {
  const [rows, setRows] = useState([]);
  const [busyId, setBusyId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [forms, setForms] = useState({});

  const canApprove =
    !previewMode && SALES_ROLES.has(roleKey);
  const canReceive =
    !previewMode && roleKey === "Warehouse_Admin";
  const canInspect =
    !previewMode && roleKey === "Inventory_Controller";
  const canRefund =
    !previewMode && SALES_ROLES.has(roleKey);

  const load = async () => {
    try {
      setLoading(true);
      setError("");
      const suffix = previewMode
        ? `?preview=1&preview_role=${encodeURIComponent(roleKey)}`
        : "";
      const data = await request(
        `/api/returns${suffix}`,
      );
      setRows(data.returns || []);
    } catch (loadError) {
      setRows([]);
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [previewMode, roleKey]);

  const visibleRows = useMemo(() => {
    if (!PURCHASING_ROLES.has(roleKey)) {
      return rows;
    }

    return rows.filter(
      (row) =>
        row.inspection_disposition ===
        "RETURN_TO_SUPPLIER",
    );
  }, [rows, roleKey]);

  const updateForm = (id, patch) => {
    setForms((current) => ({
      ...current,
      [id]: {
        disposition:
          current[id]?.disposition || "RESTOCK",
        inspection_notes:
          current[id]?.inspection_notes || "",
        ...patch,
      },
    }));
  };

  const action = async (row, name) => {
    if (previewMode || busyId) return;

    try {
      setBusyId(row.return_id);
      setError("");

      const form = forms[row.return_id] || {
        disposition: "RESTOCK",
        inspection_notes: "",
      };

      await request(
        `/api/returns/${row.return_id}`,
        {
          method: "PUT",
          body: {
            action: name,
            ...(name === "inspect"
              ? {
                  disposition: form.disposition,
                  inspection_notes:
                    form.inspection_notes,
                }
              : {}),
          },
        },
      );

      await load();
    } catch (actionError) {
      setError(actionError.message);
    } finally {
      setBusyId(null);
    }
  };

  if (loading) {
    return (
      <div className="sales-returns-empty">
        Loading return workflow...
      </div>
    );
  }

  if (!visibleRows.length) {
    return (
      <div className="sales-returns-empty">
        {error || roleHelp(roleKey)}
      </div>
    );
  }

  return (
    <div className="sales-returns">
      <div className="sales-returns-empty">
        {roleHelp(roleKey)}
      </div>

      {error && (
        <div className="sales-returns-error">
          {error}
        </div>
      )}

      {visibleRows.map((row) => {
        const form = forms[row.return_id] || {
          disposition: "RESTOCK",
          inspection_notes: "",
        };

        return (
          <article
            key={row.return_id}
            className="sales-return-card"
          >
            <header>
              <div>
                <span>RETURN #{row.return_id}</span>
                <h3>
                  Order #{row.order_id} - {row.customer_name}
                </h3>
                <small>{row.customer_email}</small>
              </div>

              <strong
                className={`sales-return-status status-${String(
                  row.status,
                ).toLowerCase()}`}
              >
                {label(row.status)}
              </strong>
            </header>

            <div className="sales-return-reason">
              <span>Customer reason</span>
              <p>{row.reason}</p>
            </div>

            <div className="sales-return-items">
              {(row.items || []).map((item) => (
                <div key={item.return_item_id}>
                  <strong>{item.product_name}</strong>
                  <span>
                    {item.quantity} x PHP{" "}
                    {Number(item.unit_price || 0).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            <div className="sales-return-refund">
              <span>Calculated refund</span>
              <strong>
                PHP {Number(row.refund_amount || 0).toFixed(2)}
              </strong>
            </div>

            {row.handled_by_name && (
              <div className="sales-return-inspection-summary">
                <strong>Last handled by</strong>
                <span>{row.handled_by_name}</span>
              </div>
            )}

            {row.inspection_disposition && (
              <div className="sales-return-inspection-summary">
                <strong>
                  {label(row.inspection_disposition)}
                </strong>
                <span>
                  {row.inspection_notes || "No inspection note."}
                </span>
              </div>
            )}

            {canInspect &&
              row.status === "RECEIVED_FOR_INSPECTION" && (
                <div className="sales-return-inspection-form">
                  <label>
                    <span>Inspection decision</span>
                    <select
                      value={form.disposition}
                      onChange={(event) =>
                        updateForm(row.return_id, {
                          disposition: event.target.value,
                        })
                      }
                    >
                      {DISPOSITIONS.map(([value, text]) => (
                        <option key={value} value={value}>
                          {text}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label>
                    <span>Inspection notes</span>
                    <textarea
                      rows={3}
                      maxLength={500}
                      value={form.inspection_notes}
                      onChange={(event) =>
                        updateForm(row.return_id, {
                          inspection_notes:
                            event.target.value,
                        })
                      }
                      placeholder="Condition, packaging, damage, or supplier-return notes..."
                    />
                  </label>
                </div>
              )}

            <footer>
              {previewMode ? (
                <span>Read only preview</span>
              ) : (
                <>
                  {canApprove &&
                    row.status === "REQUESTED" && (
                      <>
                        <button
                          type="button"
                          onClick={() =>
                            action(row, "approve")
                          }
                          disabled={
                            busyId === row.return_id
                          }
                        >
                          Approve
                        </button>

                        <button
                          type="button"
                          className="is-danger"
                          onClick={() =>
                            action(row, "reject")
                          }
                          disabled={
                            busyId === row.return_id
                          }
                        >
                          Reject
                        </button>
                      </>
                    )}

                  {canReceive &&
                    row.status === "APPROVED" && (
                      <button
                        type="button"
                        onClick={() =>
                          action(row, "receive")
                        }
                        disabled={
                          busyId === row.return_id
                        }
                      >
                        Mark item received
                      </button>
                    )}

                  {canInspect &&
                    row.status ===
                      "RECEIVED_FOR_INSPECTION" && (
                      <button
                        type="button"
                        onClick={() =>
                          action(row, "inspect")
                        }
                        disabled={
                          busyId === row.return_id
                        }
                      >
                        Complete inspection
                      </button>
                    )}

                  {canRefund &&
                    row.status === "REFUND_PENDING" && (
                      <button
                        type="button"
                        onClick={() =>
                          action(row, "refund")
                        }
                        disabled={
                          busyId === row.return_id
                        }
                      >
                        Mark refunded
                      </button>
                    )}

                  {PURCHASING_ROLES.has(roleKey) && (
                    <span>
                      Supplier-return follow-up
                    </span>
                  )}

                  {!canApprove &&
                    !canReceive &&
                    !canInspect &&
                    !canRefund &&
                    !PURCHASING_ROLES.has(roleKey) && (
                      <span>Read only</span>
                    )}
                </>
              )}
            </footer>
          </article>
        );
      })}
    </div>
  );
}
