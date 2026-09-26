import React, { useMemo, useState } from "react";
import { money, number, formatDate, orderStatusClass } from "../../../utils/super-admin/superAdminUtils.js";
import { EmptyTable } from "../common/AdminCommon.jsx";

function SalesOrders({ data }) {
  const orders = data.orders || [];
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");

  const statuses = useMemo(
    () => [...new Set(orders.map((order) => order.status).filter(Boolean))].sort(),
    [orders]
  );

  const filteredOrders = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return orders.filter((order) => {
      const statusMatch = status === "all" || order.status === status;
      const searchMatch = !needle || [
        order.order_id, order.customer_name, order.customer_contact,
        order.customer_user_id, order.status,
      ].some((value) => String(value ?? "").toLowerCase().includes(needle));
      return statusMatch && searchMatch;
    });
  }, [orders, search, status]);

  return (
    <>
      <div className="section-head"><div><h2>Sales Orders</h2><p>Live orders from WBO_Orders and WBO_OrderDetails.</p></div></div>

      <div className="ops-panel user-filter-panel">
        <div className="user-search-wrap">
          <input className="user-search-input" type="search" value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search order, customer, user ID..." aria-label="Search sales orders" />
          {search && <button className="user-search-clear" type="button" onClick={() => setSearch("")}>Clear</button>}
        </div>
        <select value={status} onChange={(event) => setStatus(event.target.value)}>
          <option value="all">All Statuses</option>
          {statuses.map((orderStatus) => <option key={orderStatus} value={orderStatus}>{orderStatus}</option>)}
        </select>
      </div>

      <div className="ops-panel"><div className="table-wrap"><table className="ops-table">
        <thead><tr><th>Order ID</th><th>Customer</th><th>User ID</th><th>Date</th><th>Items</th><th>Total</th><th>Status</th></tr></thead>
        <tbody>
          {filteredOrders.length === 0
            ? <EmptyTable colSpan={7} text="No sales orders match your filters." />
            : filteredOrders.map((order) => <tr key={order.order_id}>
                <td>#WB-{order.order_id}</td><td>{order.customer_name}</td><td>{order.customer_user_id}</td>
                <td>{formatDate(order.order_date)}</td><td>{number(order.total_quantity)}</td><td>{money(order.total_amount)}</td>
                <td><span className={`status-badge ${orderStatusClass(order.status)}`}>{order.status}</span></td>
              </tr>)}
        </tbody>
      </table></div></div>
    </>
  );
}

export default SalesOrders;