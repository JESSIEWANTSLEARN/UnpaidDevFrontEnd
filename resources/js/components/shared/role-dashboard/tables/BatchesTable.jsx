import React, { useMemo, useState } from "react";
import Empty from "../common/Empty.jsx";
import { date, number } from "../utils/formatters.js";

export default function BatchesTable({ batches = [] }) {
  const [search, setSearch] = useState("");

  const filteredBatches = useMemo(() => {
    const needle = search.trim().toLowerCase();

    if (!needle) return batches;

    return batches.filter((batch) =>
      [
        batch.batch_number,
        batch.product_name,
        batch.sku,
        batch.received_date,
        batch.expiry_date,
      ].some((value) =>
        String(value ?? "").toLowerCase().includes(needle)
      )
    );
  }, [batches, search]);

  if (!batches.length) {
    return <Empty text="No inventory batches found." />;
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
            placeholder="Search batch, product, SKU, expiry..."
            aria-label="Search inventory batches"
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

      {filteredBatches.length === 0 ? (
        <Empty text="No inventory batches match your search." />
      ) : (
        <div className="role-live-table-wrap">
          <table className="role-live-table">
            <thead>
              <tr>
                <th>Batch</th>
                <th>Product</th>
                <th>SKU</th>
                <th>Received</th>
                <th>Current</th>
                <th>Received Date</th>
                <th>Expiry</th>
              </tr>
            </thead>
            <tbody>
              {filteredBatches.map((batch) => (
                <tr key={batch.batch_id}>
                  <td>{batch.batch_number}</td>
                  <td>{batch.product_name}</td>
                  <td>{batch.sku}</td>
                  <td>{number(batch.quantity_received)}</td>
                  <td>{number(batch.current_quantity)}</td>
                  <td>{date(batch.received_date)}</td>
                  <td>{date(batch.expiry_date)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}