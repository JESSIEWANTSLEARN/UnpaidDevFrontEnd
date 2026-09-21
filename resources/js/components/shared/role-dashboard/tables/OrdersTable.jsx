import React from "react";
import Empty from "../common/Empty.jsx";
import { date, money, number } from "../utils/formatters.js";

export default function OrdersTable({ orders = [] }) {
  if (!orders.length) {
    return (
      <Empty text="No sales orders found." />
    );
  }

  return (
    <div className="role-live-table-wrap">
      <table className="role-live-table">
        <thead>
          <tr>
            <th>Order</th>
            <th>Date</th>
            <th>Status</th>
            <th>Units</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.order_id}>
              <td>#{order.order_id}</td>
              <td>{date(order.order_date)}</td>
              <td>{order.status}</td>
              <td>
                {number(
                  order.total_quantity,
                )}
              </td>
              <td>
                {money(order.total_amount)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
