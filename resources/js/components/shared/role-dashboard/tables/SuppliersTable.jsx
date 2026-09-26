import React, { useMemo, useState } from "react";
import Empty from "../common/Empty.jsx";
import { number } from "../utils/formatters.js";

export default function SuppliersTable({
  suppliers = [],
  previewMode,
  onEdit,
}) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");

  const statuses = useMemo(
    () =>
      [...new Set(suppliers.map((supplier) => supplier.supplier_status).filter(Boolean))].sort(),
    [suppliers]
  );

  const filteredSuppliers = useMemo(() => {
    const needle = search.trim().toLowerCase();

    return suppliers.filter((supplier) => {
      const statusMatch =
        status === "all" || supplier.supplier_status === status;

      const searchMatch =
        !needle ||
        [
          supplier.supplier_id,
          supplier.name,
          supplier.supplier_status,
          supplier.contact_number,
          supplier.email,
          supplier.address,
        ].some((value) =>
          String(value ?? "").toLowerCase().includes(needle)
        );

      return statusMatch && searchMatch;
    });
  }, [suppliers, search, status]);

  if (!suppliers.length) {
    return <Empty text="No suppliers found." />;
  }

  return (
    <>
      <div className="role-live-filter-bar">
        <div className="role-live-search-wrap">
          <input
            className="role-live-search-input"
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search supplier, email, contact..."
            aria-label="Search suppliers"
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

        <select
          className="role-live-filter-select"
          value={status}
          onChange={(event) => setStatus(event.target.value)}
          aria-label="Filter suppliers by status"
        >
          <option value="all">All Statuses</option>
          {statuses.map((supplierStatus) => (
            <option key={supplierStatus} value={supplierStatus}>
              {supplierStatus}
            </option>
          ))}
        </select>
      </div>

      {filteredSuppliers.length === 0 ? (
        <Empty text="No suppliers match your filters." />
      ) : (
        <div className="role-live-table-wrap">
          <table className="role-live-table">
            <thead>
              <tr>
                <th>Supplier</th>
                <th>Status</th>
                <th>Contact</th>
                <th>Email</th>
                <th>Lead Time</th>
                <th>Products</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredSuppliers.map((supplier) => (
                <tr key={supplier.supplier_id}>
                  <td>{supplier.name}</td>
                  <td>{supplier.supplier_status}</td>
                  <td>{supplier.contact_number || "-"}</td>
                  <td>{supplier.email || "-"}</td>
                  <td>{number(supplier.lead_time_days)} day(s)</td>
                  <td>{number(supplier.product_count)}</td>
                  <td>
                    <button
                      type="button"
                      className="role-live-table-action"
                      disabled={previewMode}
                      onClick={() => onEdit(supplier)}
                    >
                      {previewMode ? "Read only" : "Edit"}
                    </button>
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