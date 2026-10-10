import React from "react";
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
  rows,
  empty = "No matching records in the loaded data.",
}) {
  if (!rows.length) return <p className="role-live-empty">{empty}</p>;
  return (
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
          {rows.map((row) => (
            <tr key={row.key}>
              {row.cells.map((cell, i) => (
                <td key={i}>{cell ?? "—"}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
