import React from "react";
import Empty from "../common/Empty.jsx";
import { number } from "../utils/formatters.js";

export default function SuppliersTable({
  suppliers = [],
  previewMode,
  onEdit,
}) {
  if (!suppliers.length) {
    return <Empty text="No suppliers found." />;
  }

  return (
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
          {suppliers.map((supplier) => (
            <tr key={supplier.supplier_id}>
              <td>{supplier.name}</td>
              <td>
                {supplier.supplier_status}
              </td>
              <td>
                {supplier.contact_number ||
                  "-"}
              </td>
              <td>{supplier.email || "-"}</td>
              <td>
                {number(
                  supplier.lead_time_days,
                )}{" "}
                day(s)
              </td>
              <td>
                {number(
                  supplier.product_count,
                )}
              </td>
              <td>
                <button
                  type="button"
                  className="role-live-table-action"
                  disabled={previewMode}
                  onClick={() =>
                    onEdit(supplier)
                  }
                >
                  {previewMode
                    ? "Read only"
                    : "Edit"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
