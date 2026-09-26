import React, { useMemo, useState } from "react";
import { number, formatDate } from "../../../utils/super-admin/superAdminUtils.js";
import { EmptyTable, StatCard } from "../common/AdminCommon.jsx";

function Inventory({ data, openModal }) {
  const batches = data.batches || [];
  const metrics = data.metrics || {};
  const [search, setSearch] = useState("");

  const filteredBatches = useMemo(() => {
    const needle = search.trim().toLowerCase();
    if (!needle) return batches;
    return batches.filter((batch) =>
      [batch.batch_number, batch.product_name, batch.sku, batch.expiry_date]
        .some((value) => String(value ?? "").toLowerCase().includes(needle))
    );
  }, [batches, search]);

  return (
    <>
      <div className="section-head">
        <div><h2>Inventory Management</h2><p>Batch-level inventory from WBO_Batches.</p></div>
        <button className="btn-primary" type="button" onClick={() => openModal("stockIn")}>+ Stock In</button>
      </div>

      <div className="stat-grid stat-grid-3">
        <StatCard title="Total Stock" value={number(metrics.total_stock)} icon="package" accent="blue" />
        <StatCard title="Low Stock Products" value={number(metrics.low_stock_items)} icon="warning" accent="orange" />
        <StatCard title="Out of Stock Products" value={number(metrics.out_of_stock)} icon="close-circle" accent="red" />
      </div>

      <div className="ops-panel user-filter-panel">
        <div className="user-search-wrap">
          <input className="user-search-input" type="search" value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search batch, product, SKU, expiry..." aria-label="Search inventory" />
          {search && <button className="user-search-clear" type="button" onClick={() => setSearch("")}>Clear</button>}
        </div>
      </div>

      <div className="ops-panel"><div className="table-wrap"><table className="ops-table">
        <thead><tr><th>Batch</th><th>Product</th><th>SKU</th><th>Received</th><th>Current</th><th>Received Date</th><th>Expiry</th></tr></thead>
        <tbody>
          {filteredBatches.length === 0
            ? <EmptyTable colSpan={7} text="No inventory batches match your search." />
            : filteredBatches.map((batch) => <tr key={batch.batch_id}>
                <td>{batch.batch_number}</td><td>{batch.product_name}</td><td>{batch.sku}</td>
                <td>{number(batch.quantity_received)}</td><td>{number(batch.current_quantity)}</td>
                <td>{formatDate(batch.received_date)}</td><td>{batch.expiry_date || "â€”"}</td>
              </tr>)}
        </tbody>
      </table></div></div>
    </>
  );
}

export default Inventory;