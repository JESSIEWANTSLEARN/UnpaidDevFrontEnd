import React, { useEffect, useState } from "react";
import { csrfFetch } from "../../../config/api.js";
import "../../../../css/sales/returns.css";

const DISPOSITIONS = [
  ["RESTOCK", "Restock"],
  ["QUARANTINE", "Quarantine"],
  ["WRITE_OFF", "Write Off"],
  ["RETURN_TO_SUPPLIER", "Return to Supplier"],
];

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

export default function SalesReturnsPanel({
  previewMode = false,
}) {
  const [rows, setRows] = useState([]);
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState("");
  const [forms, setForms] = useState({});

  const load = async () => {
    try {
      setError("");
      const suffix = previewMode ? "?preview=1" : "";
      const data = await request(
        `/api/sales-role/returns${suffix}`,
      );
      setRows(data.returns || []);
    } catch (loadError) {
      setError(loadError.message);
    }
  };

  useEffect(() => {
    load();
  }, [previewMode]);

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
        `/api/sales-role/returns/${row.return_id}`,
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

  if (!rows.length) {
    return (
      <div className="sales-returns-empty">
        {error || "No return requests yet."}
      </div>
    );
  }

  return (
    <div className="sales-returns">
      {error && (
        <div className="sales-returns-error">
          {error}
        </div>
      )}

      {rows.map((row) => {
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
                  Order #{row.order_id} · {row.customer_name}
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
                    {item.quantity} × PHP{" "}
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

            {!previewMode &&
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
                    />
                  </label>
                </div>
              )}

            <footer>
              {previewMode ? (
                <span>Read only preview</span>
              ) : (
                <>
                  {row.status === "REQUESTED" && (
                    <>
                      <button
                        type="button"
                        onClick={() => action(row, "approve")}
                        disabled={busyId === row.return_id}
                      >
                        Approve
                      </button>
                      <button
                        type="button"
                        className="is-danger"
                        onClick={() => action(row, "reject")}
                        disabled={busyId === row.return_id}
                      >
                        Reject
                      </button>
                    </>
                  )}

                  {row.status === "APPROVED" && (
                    <button
                      type="button"
                      onClick={() => action(row, "receive")}
                      disabled={busyId === row.return_id}
                    >
                      Mark item received
                    </button>
                  )}

                  {row.status === "RECEIVED_FOR_INSPECTION" && (
                    <button
                      type="button"
                      onClick={() => action(row, "inspect")}
                      disabled={busyId === row.return_id}
                    >
                      Complete inspection
                    </button>
                  )}

                  {row.status === "REFUND_PENDING" && (
                    <button
                      type="button"
                      onClick={() => action(row, "refund")}
                      disabled={busyId === row.return_id}
                    >
                      Mark refunded
                    </button>
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