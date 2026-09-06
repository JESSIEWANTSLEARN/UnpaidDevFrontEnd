import React from "react";
import { number, formatDate } from "../../../utils/super-admin/superAdminUtils.js";
import { EmptyTable } from "../common/AdminCommon.jsx";

function StockMovement({ data }) {
  const transactions = data.transactions || [];
  return (
    <>
      <div className="section-head"><div><h2>Stock Movement</h2><p>Live transaction history from WBO_Transactions.</p></div></div>
      <div className="ops-panel"><div className="table-wrap"><table className="ops-table">
        <thead><tr><th>ID</th><th>Product</th><th>Batch</th><th>Type</th><th>Qty Change</th><th>Order</th><th>Performed By</th><th>Date</th></tr></thead>
        <tbody>{transactions.length === 0 ? <EmptyTable colSpan={8} text="No stock transactions recorded yet." /> : transactions.map((item) => <tr key={item.transaction_id}>
          <td>{item.transaction_id}</td><td>{item.product_name}</td><td>{item.batch_number}</td><td>{item.transaction_type}</td><td className={Number(item.quantity_change) < 0 ? "qty-negative" : "qty-positive"}>{Number(item.quantity_change) > 0 ? "+" : ""}{number(item.quantity_change)}</td><td>{item.order_id ? `#${item.order_id}` : "—"}</td><td>{item.performed_by || `User #${item.performed_by_user_id}`}</td><td>{formatDate(item.timestamp)}</td>
        </tr>)}</tbody>
      </table></div></div>
    </>
  );
}


export default StockMovement;
