const matches = (values, query) => values.join(" ").toLocaleLowerCase().includes(String(query || "").trim().toLocaleLowerCase());

export function filterImportHistory(rows, query = "") {
  return rows.filter((row) => matches([row.import_id, row.original_filename, row.import_type, row.status, row.uploaded_by_name, row.created_at], query));
}

export function filterImportRows(rows, query = "", result = "all") {
  return rows.filter((row) => {
    const valid = Boolean(row.valid);
    if (result === "valid" && !valid || result === "invalid" && valid) return false;
    return matches([row.row_number, row.action, valid ? "valid" : "invalid", ...Object.values(row.data || {}), ...(row.errors || []).map((error) => error.message || error)], query);
  });
}

export function filterWorkflowRows(rows, query = "", status = "all") {
  const text = (value) => value && typeof value === "object" ? Object.values(value).map(text).join(" ") : String(value ?? "");
  return rows.filter((row) => (status === "all" || row.status === status) && matches([text(row)], query));
}
