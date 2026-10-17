import React, { useMemo, useState } from "react";
import Section from "../layout/Section.jsx";

export function Workspace({ title, description, scope, children }) {
  return (
    <Section title={title} description={description}>
      {scope && <p className="role-workspace-note">{scope}</p>}
      {children}
    </Section>
  );
}
export function ModuleButton({ module, onModuleChange, children }) {
  return (
    <button
      type="button"
      className="role-live-table-action"
      onClick={() => onModuleChange(module)}
    >
      {children || `Open ${module}`}
    </button>
  );
}
export function Choice({ label, value, onChange, options }) {
  return (
    <label className="role-workspace-choice">
      <span>{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map((option) => {
          const [value, text] = Array.isArray(option)
            ? option
            : [option, option];
          return (
            <option key={value} value={value}>
              {text}
            </option>
          );
        })}
      </select>
    </label>
  );
}
export function WorkspaceTable({
  headings,
  rows = [],
  empty = "No matching records in the loaded data.",
}) {
  const [search, setSearch] = useState("");
  const filteredRows = useMemo(() => {
    const needle = search.trim().toLowerCase();
    if (!needle) return rows;

    const textFor = (value) => {
      if (value == null || typeof value === "boolean") return "";
      if (typeof value === "string" || typeof value === "number") return String(value);
      if (Array.isArray(value)) return value.map(textFor).join(" ");
      if (React.isValidElement(value)) return textFor(value.props.children);
      return "";
    };

    return rows.filter((row) =>
      [row.key, ...(row.cells || [])]
        .map(textFor)
        .join(" ")
        .toLowerCase()
        .includes(needle),
    );
  }, [rows, search]);

  return (
    <>
      <div className="role-live-filter-bar" role="search">
        <div className="role-live-search-wrap">
          <input
            className="role-live-search-input"
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search these records..."
            aria-label={`Search ${String(headings?.[0] || "table").toLowerCase()} records`}
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
      </div>
      {!filteredRows.length ? (
        <p className="role-live-empty">{search ? "No rows match your search." : empty}</p>
      ) : (
        <div className="role-live-table-wrap">
          <table className="role-live-table">
            <thead>
              <tr>
                {headings.map((h) => (
                  <th key={h} scope="col">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredRows.map((row) => (
                <tr key={row.key}>
                  {row.cells.map((cell, i) => (
                    <td key={i}>{cell ?? "—"}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
