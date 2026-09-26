import React, { useMemo, useState } from "react";
import { number, formatDate } from "../../../utils/super-admin/superAdminUtils.js";
import { EmptyTable } from "../common/AdminCommon.jsx";

function StockMovement({ data }) {
  const transactions = data.transactions || [];
  const [search, setSearch] = useState("");
  const [type, setType] = useState("all");

  const types = useMemo(
    () => [...new Set(transactions.map((item) => item.transaction_type).filter(Boolean))].sort(),
    [transactions]
  );

  const filteredTransactions = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return transactions.filter((item) => {
      const typeMatch = type === "all" || item.transaction_type === type;
      const searchMatch = !needle || [
        item.transaction_id, item.product_name, item.sku, item.batch_number,
        item.transaction_type, item.order_id, item.purchase_order_id,
        item.performed_by, item.performed_by_user_id, item.reference_note,
      ].some((value) => String(value ?? "").toLowerCase().includes(needle));
      return typeMatch && searchMatch;
    });
  }, [transactions, search, type]);

  return (
    <>
      <div className="section-head"><div><h2>Stock Movement</h2><p>Live transaction history from WBO_Transactions.</p></div></div>

      <div className="ops-panel user-filter-panel">
        <div className="user-search-wrap">
          <input className="user-search-input" type="search" value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search transaction, product, batch, user..." aria-label="Search stock movement" />
          {search && <button className="user-search-clear" type="button" onClick={() => setSearch("")}>Clear</button>}
        </div>
        <select value={type} onChange={(event) => setType(event.target.value)}>
          <option value="all">All Movement Types</option>
          {types.map((movementType) => <option key={movementType} value={movementType}>{movementType}</option>)}
        </select>
      </div>

      <div className="ops-panel"><div className="table-wrap"><table className="ops-table">
        <thead><tr><th>ID</th><th>Product</th><th>Batch</th><th>Type</th><th>Qty Change</th><th>Order</th><th>Performed By</th><th>Date</th></tr></thead>
        <tbody>
          {filteredTransactions.length === 0
            ? <EmptyTable colSpan={8} text="No stock movements match your filters." />
            : filteredTransactions.map((item) => <tr key={item.transaction_id}>
                <td>{item.transaction_id}</td><td>{item.product_name}</td><td>{item.batch_number}</td><td>{item.transaction_type}</td>
                <td className={Number(item.quantity_change) < 0 ? "qty-negative" : "qty-positive"}>
                  {Number(item.quantity_change) > 0 ? "+" : ""}{number(item.quantity_change)}
                </td>
                <td>{item.order_id ? `#${item.order_id}` : "â€”"}</td>
                <td>{item.performed_by || `User #${item.performed_by_user_id}`}</td><td>{formatDate(item.timestamp)}</td>
              </tr>)}
        </tbody>
      </table></div></div>
    </>
  );
}

export default StockMovement;