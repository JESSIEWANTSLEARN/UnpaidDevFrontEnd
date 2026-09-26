import React, { useMemo, useState } from "react";
import { number } from "../../../utils/super-admin/superAdminUtils.js";
import { EmptyTable } from "../common/AdminCommon.jsx";

function Suppliers({ data, openModal }) {
  const suppliers = data.suppliers || [];
  const [search, setSearch] = useState("");

  const filteredSuppliers = useMemo(() => {
    const needle = search.trim().toLowerCase();

    if (!needle) {
      return suppliers;
    }

    return suppliers.filter((supplier) =>
      [
        supplier.name,
        supplier.contact_number,
        supplier.email,
        supplier.address,
      ].some((value) =>
        String(value || "")
          .toLowerCase()
          .includes(needle),
      ),
    );
  }, [suppliers, search]);

  return (
    <>
      <div className="section-head">
        <div>
          <h2>Suppliers</h2>
          <p>Live supplier records and product counts.</p>
        </div>

        <button
          className="btn-primary"
          type="button"
          onClick={() => openModal("addSupplier")}
        >
          + Add Supplier
        </button>
      </div>

      <div className="ops-panel user-filter-panel">
        <div className="user-search-wrap">
          <input
            className="user-search-input"
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search suppliers, email, contact..."
            aria-label="Search suppliers"
          />

          {search && (
            <button
              className="user-search-clear"
              type="button"
              onClick={() => setSearch("")}
            >
              Clear
            </button>
          )}
        </div>
      </div>

      <div className="ops-panel">
        <div className="table-wrap">
          <table className="ops-table">
            <thead>
              <tr>
                <th>Supplier</th>
                <th>Contact</th>
                <th>Email</th>
                <th>Lead Time</th>
                <th>Products</th>
              </tr>
            </thead>

            <tbody>
              {filteredSuppliers.length === 0 ? (
                <EmptyTable
                  colSpan={5}
                  text="No suppliers match your search."
                />
              ) : (
                filteredSuppliers.map((supplier) => (
                  <tr key={supplier.supplier_id}>
                    <td>{supplier.name}</td>
                    <td>{supplier.contact_number || "—"}</td>
                    <td>{supplier.email || "—"}</td>
                    <td>{number(supplier.lead_time_days)} day(s)</td>
                    <td>{number(supplier.product_count)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

export default Suppliers;
