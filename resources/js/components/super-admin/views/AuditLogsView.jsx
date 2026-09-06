import React, { useEffect, useMemo, useState } from "react";
import { apiRequest } from "../../../services/super-admin/superAdminApi.js";
import { formatDate } from "../../../utils/super-admin/superAdminUtils.js";
import { EmptyTable } from "../common/AdminCommon.jsx";

const ROLE_OPTIONS = [
  ["all", "All Roles"],
  ["super_admin", "Super Admin"],
  ["Operations_Manager", "Operations Manager"],
  ["Purchasing_Manager", "Purchasing Manager"],
  ["Warehouse_Admin", "Warehouse Admin"],
  ["Sales_Manager", "Sales Manager"],
  ["Purchasing_Staff", "Purchasing Staff"],
  ["Inventory_Controller", "Inventory Controller"],
  ["Sales_Staff", "Sales Staff"],
  ["User_Admin", "User Admin"],
  ["System_User", "System User"],
  ["system", "System / No User"],
];

const CATEGORY_OPTIONS = [
  ["all", "All Actions"],
  ["authentication", "Authentication"],
  ["catalog", "Catalog"],
  ["inventory", "Inventory"],
  ["purchase_orders", "Purchase Orders"],
  ["sales", "Sales"],
  ["users", "Users"],
  ["settings", "Settings"],
  ["backup_reports", "Backup / Reports"],
  ["security", "Security"],
  ["system", "System / Other"],
];

const PERIOD_OPTIONS = [
  ["today", "Today"],
  ["7days", "Past 7 Days"],
  ["28days", "Past 28 Days"],
  ["all", "All Time"],
];

const ACTION_CATEGORY_PATTERNS = [
  ["Authentication", ["LOGIN", "LOGOUT", "ACCOUNT_VERIFIED", "OTP", "AUTH", "SIGNUP"]],
  ["Catalog", ["PRODUCT", "CATEGORY", "SUPPLIER"]],
  ["Inventory", ["STOCK", "INVENTORY", "BATCH", "TRANSACTION"]],
  ["Purchase Orders", ["PURCHASE_ORDER", "PO"]],
  ["Sales", ["SALES", "SALE", "ORDER"]],
  ["Users", ["USER"]],
  ["Settings", ["COMPANY", "SETTING", "NOTIFICATION"]],
  ["Backup / Reports", ["BACKUP", "REPORT"]],
  ["Security", ["PASSWORD", "SECURITY", "TRUSTED", "SESSION"]],
];

function actionCategory(action = "") {
  const upper = String(action).toUpperCase();

  for (const [label, prefixes] of ACTION_CATEGORY_PATTERNS) {
    if (prefixes.some((prefix) => upper.startsWith(prefix))) {
      return label;
    }
  }

  return "System / Other";
}

function millisecondsUntilNextManilaMidnight() {
  const MANILA_OFFSET_MS = 8 * 60 * 60 * 1000;
  const nowMs = Date.now();
  const manilaNow = new Date(nowMs + MANILA_OFFSET_MS);

  const nextMidnightUtcMs =
    Date.UTC(
      manilaNow.getUTCFullYear(),
      manilaNow.getUTCMonth(),
      manilaNow.getUTCDate() + 1,
      0,
      0,
      0,
    ) - MANILA_OFFSET_MS;

  return Math.max(1000, nextMidnightUtcMs - nowMs);
}
function roleLabel(role) {
  if (!role) return "System";
  return ROLE_OPTIONS.find(([value]) => value === role)?.[1] || role.replaceAll("_", " ");
}

export default function AuditLogs() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [period, setPeriod] = useState("today");
  const [role, setRole] = useState("all");
  const [category, setCategory] = useState("all");
  const [page, setPage] = useState(1);
  const [dailyResetToken, setDailyResetToken] = useState(0);

  const [logs, setLogs] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    per_page: 50,
    total: 0,
    last_page: 1,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(search.trim());
      setPage(1);
    }, 300);

    return () => window.clearTimeout(timer);
  }, [search]);
  // WBO PHASE 3: reset Audit Logs view at Manila midnight.
  // This resets only the UI filters; WBO_AuditLogs history is preserved.
  useEffect(() => {
    const timer = window.setTimeout(() => {
      setSearch("");
      setDebouncedSearch("");
      setPeriod("today");
      setRole("all");
      setCategory("all");
      setPage(1);
      setDailyResetToken((value) => value + 1);
    }, millisecondsUntilNextManilaMidnight());

    return () => window.clearTimeout(timer);
  }, [dailyResetToken]);

  useEffect(() => {
    let cancelled = false;

    const params = new URLSearchParams({
      period,
      role,
      category,
      page: String(page),
      per_page: "50",
    });

    if (debouncedSearch) {
      params.set("search", debouncedSearch);
    }

    setLoading(true);
    setError("");

    apiRequest(`/api/super-admin/audit-logs?${params.toString()}`)
      .then((result) => {
        if (cancelled) return;

        setLogs(result.logs || []);
        setPagination(
          result.pagination || {
            page: 1,
            per_page: 50,
            total: 0,
            last_page: 1,
          },
        );
      })
      .catch((requestError) => {
        if (!cancelled) {
          setError(requestError.message || "Unable to load audit logs.");
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [period, role, category, page, debouncedSearch, dailyResetToken]);

  const rangeText = useMemo(() => {
    const total = Number(pagination.total || 0);
    const currentPage = Number(pagination.page || 1);
    const perPage = Number(pagination.per_page || 50);

    if (total === 0) return "0 records";

    const start = (currentPage - 1) * perPage + 1;
    const end = Math.min(currentPage * perPage, total);

    return `${start}-${end} of ${total} records`;
  }, [pagination]);

  const resetFilters = () => {
    setSearch("");
    setDebouncedSearch("");
    setPeriod("today");
    setRole("all");
    setCategory("all");
    setPage(1);
  };

  return (
    <>
      <div className="section-head">
        <div>
          <h2>Audit Logs</h2>
          <p>Search and filter important activity recorded in WBO_AuditLogs.</p>
        </div>
      </div>

      <div className="ops-panel audit-filter-panel">
        <div className="audit-filter-grid">
          <div className="audit-filter-field audit-search-field">
            <label htmlFor="audit-search">Search</label>
            <input
              id="audit-search"
              type="search"
              value={search}
              placeholder="User, email, action, description, IP..."
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>

          <div className="audit-filter-field">
            <label htmlFor="audit-period">Period</label>
            <select
              id="audit-period"
              value={period}
              onChange={(event) => {
                setPeriod(event.target.value);
                setPage(1);
              }}
            >
              {PERIOD_OPTIONS.map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>

          <div className="audit-filter-field">
            <label htmlFor="audit-role">Role</label>
            <select
              id="audit-role"
              value={role}
              onChange={(event) => {
                setRole(event.target.value);
                setPage(1);
              }}
            >
              {ROLE_OPTIONS.map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>

          <div className="audit-filter-field">
            <label htmlFor="audit-category">Action Category</label>
            <select
              id="audit-category"
              value={category}
              onChange={(event) => {
                setCategory(event.target.value);
                setPage(1);
              }}
            >
              {CATEGORY_OPTIONS.map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>

          <button className="btn-ghost audit-reset-button" type="button" onClick={resetFilters}>
            Reset
          </button>
        </div>

        <div className="audit-filter-summary">
          <span>{rangeText}</span>
          <span>Daily view resets at 12:00 AM Philippine Time; history is preserved.</span>
        </div>
      </div>

      {error && (
        <div className="ops-panel audit-error-panel">
          {error}
        </div>
      )}

      <div className="ops-panel">
        <div className="table-wrap">
          <table className="ops-table audit-table">
            <thead>
              <tr>
                <th>Log ID</th>
                <th>User</th>
                <th>Role</th>
                <th>Category</th>
                <th>Action</th>
                <th>Description</th>
                <th>IP Address</th>
                <th>Date & Time</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <EmptyTable colSpan={8} text="Loading audit logs..." />
              ) : logs.length === 0 ? (
                <EmptyTable colSpan={8} text="No audit logs match the selected filters." />
              ) : (
                logs.map((log) => (
                  <tr key={log.log_id}>
                    <td>{log.log_id}</td>
                    <td>
                      <div className="audit-user-cell">
                        <strong>{log.user_name || log.user_email || "System"}</strong>
                        {log.user_email && log.user_email !== log.user_name && (
                          <span>{log.user_email}</span>
                        )}
                      </div>
                    </td>
                    <td>{roleLabel(log.user_role)}</td>
                    <td>
                      <span className="audit-category-badge">
                        {actionCategory(log.action)}
                      </span>
                    </td>
                    <td><strong>{log.action}</strong></td>
                    <td>{log.description || "—"}</td>
                    <td>{log.ip_address || "—"}</td>
                    <td>{formatDate(log.created_at)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="audit-pagination">
          <button
            className="btn-ghost"
            type="button"
            disabled={loading || pagination.page <= 1}
            onClick={() => setPage((value) => Math.max(1, value - 1))}
          >
            Previous
          </button>

          <span>
            Page {pagination.page || 1} of {pagination.last_page || 1}
          </span>

          <button
            className="btn-ghost"
            type="button"
            disabled={loading || pagination.page >= pagination.last_page}
            onClick={() => setPage((value) => value + 1)}
          >
            Next
          </button>
        </div>
      </div>
    </>
  );
}