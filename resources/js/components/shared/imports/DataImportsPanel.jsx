import React, { useEffect, useMemo, useRef, useState } from "react";
import { apiRequest } from "../../../services/super-admin/superAdminApi.js";
import "../../../../css/shared/data-imports.css";

const IMPORT_TYPES = {
  PRODUCTS: {
    label: "Products",
    note: "Creates or updates products by SKU. Missing categories are created automatically; supplier names must already exist.",
    headers: [
      "sku",
      "name",
      "description",
      "category",
      "supplier",
      "abc_class",
      "is_seasonal",
      "is_visible",
      "is_featured",
      "unit_cost",
      "unit_price",
      "reorder_point",
    ],
    sample: [
      "WB-FAN-001",
      "Rechargeable Fan",
      "Portable rechargeable fan",
      "Cooling",
      "",
      "B",
      "0",
      "1",
      "0",
      "850",
      "1299",
      "10",
    ],
  },
  SUPPLIERS: {
    label: "Suppliers",
    note: "Creates or updates supplier records by supplier name.",
    headers: [
      "name",
      "contact_number",
      "email",
      "address",
      "lead_time_days",
      "supplier_status",
    ],
    sample: [
      "Demo Supplier",
      "09123456789",
      "supplier@example.com",
      "Laguna, Philippines",
      "7",
      "ACTIVE",
    ],
  },
  INVENTORY: {
    label: "Inventory",
    note: "Receives new inventory batches by product SKU. Existing product + batch-number combinations are rejected to prevent double counting.",
    headers: [
      "sku",
      "batch_number",
      "quantity_received",
      "received_date",
      "expiry_date",
    ],
    sample: [
      "WB-FAN-001",
      "BATCH-2026-001",
      "25",
      "2026-09-28",
      "2027-09-28",
    ],
  },
};

function escapeCsv(value) {
  const text = String(value ?? "");
  return /[",\n]/.test(text)
    ? `"${text.replaceAll('"', '""')}"`
    : text;
}

function statusClass(status) {
  return `data-import-status is-${String(status || "")
    .toLowerCase()
    .replaceAll("_", "-")}`;
}

function formatDate(value) {
  if (!value) return "-";
  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? String(value)
    : date.toLocaleString();
}

export default function DataImportsPanel({
  roleKey,
  previewMode = false,
  onDashboardRefresh,
}) {
  const inputRef = useRef(null);
  const [allowedTypes, setAllowedTypes] = useState([]);
  const [importType, setImportType] = useState("");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const config =
    IMPORT_TYPES[importType] ||
    IMPORT_TYPES[allowedTypes[0]] ||
    null;

  const acceptedFile = useMemo(
    () =>
      file &&
      /\.(csv|xls|xlsx)$/i.test(file.name),
    [file],
  );

  const loadHistory = async () => {
    try {
      setHistoryLoading(true);
      setError("");

      const suffix = previewMode
        ? `?preview=1&preview_role=${encodeURIComponent(roleKey)}`
        : "";
      const result = await apiRequest(
        `/api/data-imports${suffix}`,
      );

      const types = result.allowed_types || [];
      setAllowedTypes(types);
      setHistory(result.imports || []);

      setImportType((current) =>
        types.includes(current)
          ? current
          : types[0] || "",
      );
    } catch (requestError) {
      setAllowedTypes([]);
      setHistory([]);
      setError(
        requestError.message ||
          "Unable to load import permissions and history.",
      );
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, [roleKey, previewMode]);

  useEffect(() => {
    setPreview(null);
    setError("");
    setNotice("");
  }, [importType, file]);

  const makeBody = () => {
    const body = new FormData();
    body.append("import_type", importType);
    body.append("file", file);
    return body;
  };

  const previewFile = async () => {
    if (
      previewMode ||
      !file ||
      !acceptedFile ||
      !importType ||
      busy
    ) {
      return;
    }

    try {
      setBusy("preview");
      setError("");
      setNotice("");

      const result = await apiRequest(
        "/api/data-imports/preview",
        {
          method: "POST",
          body: makeBody(),
          formData: true,
        },
      );

      setPreview(result.preview || null);
      setNotice(
        "Preview complete. Review invalid rows before importing.",
      );
    } catch (requestError) {
      setPreview(null);
      setError(
        requestError.message ||
          "The file could not be previewed.",
      );
    } finally {
      setBusy("");
    }
  };

  const confirmImport = async () => {
    if (
      previewMode ||
      !file ||
      !preview ||
      busy
    ) {
      return;
    }

    const proceed = window.confirm(
      `Import ${preview.valid_rows} valid row(s) from ${file.name}? Invalid rows will be logged and skipped.`,
    );

    if (!proceed) return;

    try {
      setBusy("import");
      setError("");
      setNotice("");

      const result = await apiRequest(
        "/api/data-imports",
        {
          method: "POST",
          body: makeBody(),
          formData: true,
        },
      );

      const summary = result.import || {};
      setNotice(
        `Import #${summary.import_id} finished: ${summary.successful_rows} successful, ${summary.failed_rows} failed.`,
      );
      setPreview(null);
      setFile(null);

      if (inputRef.current) {
        inputRef.current.value = "";
      }

      await loadHistory();
      onDashboardRefresh?.();
    } catch (requestError) {
      setError(
        requestError.message ||
          "The import could not be completed.",
      );
    } finally {
      setBusy("");
    }
  };

  const downloadTemplate = () => {
    if (!config) return;

    const csv = [
      config.headers,
      config.sample,
    ]
      .map((row) => row.map(escapeCsv).join(","))
      .join("\n");

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download =
      `wbo-${importType.toLowerCase()}-template.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  if (!historyLoading && !allowedTypes.length) {
    return (
      <section className="data-import-page">
        <div className="data-import-message is-error">
          This role does not have a data-import permission.
        </div>
      </section>
    );
  }

  return (
    <section className="data-import-page">
      <header className="data-import-title">
        <div>
          <span>DATA MANAGEMENT</span>
          <h1>Data Imports</h1>
          <p>
            Import only the data assigned to this role.
            Super Admin can supervise every import type and
            view all import history.
          </p>
        </div>

        {config && (
          <button
            type="button"
            className="data-import-template-button"
            onClick={downloadTemplate}
          >
            Download {config.label} template
          </button>
        )}
      </header>

      {previewMode && (
        <div className="data-import-message is-success">
          Role preview is read only. Templates and history
          remain visible, but uploads are disabled.
        </div>
      )}

      {error && (
        <div className="data-import-message is-error">
          {error}
        </div>
      )}

      {notice && (
        <div className="data-import-message is-success">
          {notice}
        </div>
      )}

      <div className="data-import-layout">
        <section className="data-import-card">
          <div className="data-import-card-head">
            <div>
              <span>STEP 1</span>
              <h2>Allowed import type</h2>
            </div>
          </div>

          <div className="data-import-type-grid">
            {allowedTypes.map((key) => {
              const item = IMPORT_TYPES[key];

              if (!item) return null;

              return (
                <button
                  type="button"
                  key={key}
                  className={
                    importType === key
                      ? "is-active"
                      : ""
                  }
                  onClick={() => setImportType(key)}
                  disabled={
                    Boolean(busy) || previewMode
                  }
                >
                  <strong>{item.label}</strong>
                  <small>{item.note}</small>
                </button>
              );
            })}
          </div>

          {config && (
            <div className="data-import-required">
              <span>Template columns</span>
              <div>
                {config.headers.map((header) => (
                  <code key={header}>{header}</code>
                ))}
              </div>
            </div>
          )}
        </section>

        <section className="data-import-card">
          <div className="data-import-card-head">
            <div>
              <span>STEP 2</span>
              <h2>Choose a file</h2>
            </div>
          </div>

          <label className="data-import-file">
            <input
              ref={inputRef}
              type="file"
              accept=".csv,.xls,.xlsx"
              disabled={
                Boolean(busy) ||
                previewMode ||
                !importType
              }
              onChange={(event) =>
                setFile(event.target.files?.[0] || null)
              }
            />
            <strong>
              {file
                ? file.name
                : "Choose CSV / XLS / XLSX"}
            </strong>
            <small>
              Maximum 10 MB and 500 data rows per import.
            </small>
          </label>

          {file && !acceptedFile && (
            <p className="data-import-file-warning">
              Use a .csv, .xls, or .xlsx file.
            </p>
          )}

          <button
            type="button"
            className="data-import-primary"
            onClick={previewFile}
            disabled={
              previewMode ||
              !file ||
              !acceptedFile ||
              !importType ||
              Boolean(busy)
            }
          >
            {busy === "preview"
              ? "Reading file..."
              : "Preview and validate"}
          </button>
        </section>
      </div>

      {preview && (
        <section className="data-import-card data-import-preview-card">
          <div className="data-import-card-head is-row">
            <div>
              <span>STEP 3</span>
              <h2>Preview validation</h2>
              <p>
                Valid rows will be imported. Invalid rows are
                skipped and stored in the error history.
              </p>
            </div>

            <button
              type="button"
              className="data-import-primary"
              onClick={confirmImport}
              disabled={
                previewMode ||
                Boolean(busy) ||
                preview.valid_rows < 1
              }
            >
              {busy === "import"
                ? "Importing..."
                : `Confirm ${preview.valid_rows} valid row(s)`}
            </button>
          </div>

          <div className="data-import-stats">
            <div>
              <span>Total rows</span>
              <strong>{preview.total_rows}</strong>
            </div>
            <div className="is-good">
              <span>Valid</span>
              <strong>{preview.valid_rows}</strong>
            </div>
            <div className="is-bad">
              <span>Invalid</span>
              <strong>{preview.invalid_rows}</strong>
            </div>
          </div>

          <div className="data-import-table-wrap">
            <table className="data-import-table">
              <thead>
                <tr>
                  <th>Row</th>
                  <th>Result</th>
                  <th>Action</th>
                  <th>Data</th>
                  <th>Validation</th>
                </tr>
              </thead>
              <tbody>
                {(preview.rows || []).map((row) => (
                  <tr key={row.row_number}>
                    <td>{row.row_number}</td>
                    <td>
                      <span
                        className={
                          row.valid
                            ? "data-import-row-valid"
                            : "data-import-row-invalid"
                        }
                      >
                        {row.valid ? "VALID" : "INVALID"}
                      </span>
                    </td>
                    <td>{row.action || "-"}</td>
                    <td>
                      <div className="data-import-row-data">
                        {Object.entries(row.data || {})
                          .slice(0, 7)
                          .map(([key, value]) => (
                            <span key={key}>
                              <b>{key}</b>
                              {String(value ?? "") || "-"}
                            </span>
                          ))}
                      </div>
                    </td>
                    <td>
                      {(row.errors || []).length
                        ? row.errors
                            .map(
                              (item) =>
                                item.message || item,
                            )
                            .join(" | ")
                        : "Ready"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {preview.total_rows >
            (preview.rows || []).length && (
            <small className="data-import-preview-note">
              Preview shows the first{" "}
              {(preview.rows || []).length} data rows.
              All rows are validated during confirmation.
            </small>
          )}
        </section>
      )}

      <section className="data-import-card">
        <div className="data-import-card-head is-row">
          <div>
            <span>IMPORT LOG</span>
            <h2>Relevant import history</h2>
            <p>
              Super Admin sees all history. Operational roles
              see history for import types assigned to them.
            </p>
          </div>

          <button
            type="button"
            className="data-import-secondary"
            onClick={loadHistory}
            disabled={historyLoading}
          >
            {historyLoading ? "Loading..." : "Refresh"}
          </button>
        </div>

        {historyLoading ? (
          <div className="data-import-empty">
            Loading import history...
          </div>
        ) : history.length ? (
          <div className="data-import-history">
            {history.map((item) => (
              <article
                className="data-import-history-card"
                key={item.import_id}
              >
                <header>
                  <div>
                    <span>IMPORT #{item.import_id}</span>
                    <h3>
                      {item.import_type} -{" "}
                      {item.original_filename}
                    </h3>
                    <small>
                      {formatDate(item.created_at)}
                      {item.uploaded_by_name
                        ? ` by ${item.uploaded_by_name}`
                        : ""}
                    </small>
                  </div>

                  <span className={statusClass(item.status)}>
                    {item.status}
                  </span>
                </header>

                <div className="data-import-history-counts">
                  <span>
                    Total <strong>{item.total_rows}</strong>
                  </span>
                  <span>
                    Success{" "}
                    <strong>{item.successful_rows}</strong>
                  </span>
                  <span>
                    Failed <strong>{item.failed_rows}</strong>
                  </span>
                </div>

                {(item.errors || []).length > 0 && (
                  <div className="data-import-errors">
                    <strong>Recent row errors</strong>
                    {(item.errors || []).map((rowError) => (
                      <p key={rowError.import_error_id}>
                        Row {rowError.row_number || "-"}
                        {rowError.field_name
                          ? ` / ${rowError.field_name}`
                          : ""}
                        : {rowError.error_message}
                      </p>
                    ))}
                    {item.error_count >
                      (item.errors || []).length && (
                      <small>
                        {item.error_count -
                          (item.errors || []).length}{" "}
                        more error(s) recorded.
                      </small>
                    )}
                  </div>
                )}
              </article>
            ))}
          </div>
        ) : (
          <div className="data-import-empty">
            No relevant imports have been confirmed yet.
          </div>
        )}
      </section>
    </section>
  );
}
