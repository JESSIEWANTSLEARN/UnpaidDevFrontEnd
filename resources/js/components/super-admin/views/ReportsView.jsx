import React, { useState } from "react";
import { money, number } from "../../../utils/super-admin/superAdminUtils.js";
import { StatCard } from "../common/AdminCommon.jsx";

const REPORT_TYPES = [
  ["complete", "Complete System", "Summary plus Products, Inventory, Suppliers, Purchase Orders, Sales Orders, Users, and Audit Logs."],
  ["products", "Products / Catalog", "Product catalog, category, supplier, pricing, visibility, and current stock."],
  ["inventory", "Inventory", "Batch-level stock, quantities received, current quantities, and expiry information."],
  ["sales", "Sales", "Sales-order line items, customers, quantities, prices, totals, and statuses."],
  ["purchase_orders", "Purchase Orders", "Purchase-order headers and line items with supplier, product, quantities, cost, and status."],
  ["suppliers", "Suppliers", "Supplier contacts, lead times, status, and linked-product counts."],
  ["users", "Users", "User account, role, verification, status, and activity timestamps."],
  ["audit_logs", "Audit Logs", "Administrative and security activity with user, role, action, IP, and Philippine time."],
];

export default function Reports({ data, handleExportReport }) {
  const metrics = data.metrics || {};
  const [reportType, setReportType] = useState("complete");

  const selected =
    REPORT_TYPES.find(([value]) => value === reportType) || REPORT_TYPES[0];

  return (
    <>
      <div className="section-head">
        <div>
          <h2>Reports & Analytics</h2>
          <p>Current-month values calculated from fulfilled orders.</p>
        </div>
      </div>

      <div className="stat-grid stat-grid-3">
        <StatCard
          title="Monthly Revenue"
          value={money(metrics.monthly_revenue)}
          icon="money"
          accent="green"
        />
        <StatCard
          title="Orders This Month"
          value={number(metrics.monthly_orders)}
          icon="cart"
          accent="blue"
        />
        <StatCard
          title="Products Sold"
          value={number(metrics.products_sold)}
          icon="package"
          accent="purple"
        />
      </div>

      <div className="ops-panel report-export-panel">
        <div className="report-export-copy">
          <h3>Export Excel Report</h3>
          <p>
            Download a real Excel workbook with readable columns, formatted values,
            and separate sheets for complete-system exports.
          </p>
        </div>

        <div className="report-export-controls">
          <div className="report-type-field">
            <label htmlFor="report-type">Report Type</label>
            <select
              id="report-type"
              value={reportType}
              onChange={(event) => setReportType(event.target.value)}
            >
              {REPORT_TYPES.map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <button
            className="btn-primary"
            type="button"
            onClick={() => handleExportReport(reportType)}
          >
            Export .xlsx
          </button>
        </div>

        <div className="report-type-description">
          <strong>{selected[1]}</strong>
          <span>{selected[2]}</span>
        </div>

        <p className="report-security-note">
          User and Audit Log exports can contain administrative information such as
          contact details or IP addresses. Handle exported files as Super Admin records.
        </p>
      </div>
    </>
  );
}