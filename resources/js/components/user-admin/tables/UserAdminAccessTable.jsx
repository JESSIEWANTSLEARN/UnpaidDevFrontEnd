import React, { useMemo, useState } from "react";
import { UserAdminEmpty } from "../common/UserAdminPrimitives.jsx";
import {
  formatUserAdminDate,
  labelUserRole,
} from "../utils/userAdminFormatters.js";

export default function UserAdminAccessTable({ rows = [] }) {
  const [search, setSearch] = useState("");
  const [action, setAction] = useState("all");
  const actions = useMemo(
    () => [...new Set(rows.map((row) => row.action).filter(Boolean))].sort(),
    [rows],
  );
  const filteredRows = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return rows.filter((row) =>
      (action === "all" || row.action === action) &&
      (!needle || [row.audit_id, row.created_at, row.user_name, row.user_role, row.action, row.description, row.ip_address]
        .some((value) => String(value ?? "").toLowerCase().includes(needle))),
    );
  }, [rows, search, action]);

  if (!rows.length) {
    return (
      <UserAdminEmpty text="No recent access-management activity." />
    );
  }

  return (
    <>
    <div className="user-admin-filters" role="search">
      <input
        type="search"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        placeholder="Search user, action, description, or IP..."
        aria-label="Search access activity"
      />
      <select value={action} onChange={(event) => setAction(event.target.value)} aria-label="Filter access activity by action">
        <option value="all">All actions</option>
        {actions.map((value) => <option key={value} value={value}>{value}</option>)}
      </select>
    </div>
    {!filteredRows.length ? <UserAdminEmpty text="No access activity matches your search and filter." /> : (
    <div className="user-admin-table-wrap">
      <table className="user-admin-table user-admin-access-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>User</th>
            <th>Action</th>
            <th>Description</th>
            <th>IP</th>
          </tr>
        </thead>
        <tbody>
          {filteredRows.map((row) => (
            <tr key={row.audit_id}>
              <td>
                {formatUserAdminDate(row.created_at)}
              </td>
              <td>
                {row.user_name || "System"}
                {row.user_role && (
                  <small>
                    {labelUserRole(row.user_role)}
                  </small>
                )}
              </td>
              <td>{row.action}</td>
              <td>{row.description || "-"}</td>
              <td>{row.ip_address || "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    )}
    </>
  );
}
