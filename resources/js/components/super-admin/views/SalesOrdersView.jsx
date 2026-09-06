import React from "react";
import { money, number, formatDate, orderStatusClass } from "../../../utils/super-admin/superAdminUtils.js";
import { EmptyTable } from "../common/AdminCommon.jsx";

function SalesOrders({ data }) {
  const orders = data.orders || [];
  return (
    <>
      <div className="section-head"><div><h2>Sales Orders</h2><p>Live orders from WBO_Orders and WBO_OrderDetails.</p></div></div>
      <div className="ops-panel"><div className="table-wrap"><table className="ops-table">
        <thead><tr><th>Order ID</th><th>Customer</th><th>User ID</th><th>Date</th><th>Items</th><th>Total</th><th>Status</th></tr></thead>
        <tbody>{orders.length === 0 ? <EmptyTable colSpan={7} text="No sales orders found." /> : orders.map((order) => <tr key={order.order_id}>
          <td>#WB-{order.order_id}</td><td>{order.customer_name}</td><td>{order.customer_user_id}</td><td>{formatDate(order.order_date)}</td><td>{number(order.total_quantity)}</td><td>{money(order.total_amount)}</td><td><span className={`status-badge ${orderStatusClass(order.status)}`}>{order.status}</span></td>
        </tr>)}</tbody>
      </table></div></div>
    </>
  );
}


export default SalesOrders;
