import React, { useMemo, useState } from "react";
import Empty from "../common/Empty.jsx";
import { date, money, number } from "../utils/formatters.js";

export default function OrdersTable({ orders = [] }) {
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
      const searchMatch =
        !needle ||
        [
          order.order_id,
          order.order_date,
          order.status,
          order.total_quantity,
          order.total_amount,
        ].some((value) =>
          String(value ?? "").toLowerCase().includes(needle)
        );

      return statusMatch && searchMatch;
    });
  }, [orders, search, status]);

  if (!orders.length) {
    return <Empty text="No sales orders found." />;
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
            placeholder="Search order, date, status..."
            aria-label="Search sales orders"
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
          aria-label="Filter sales orders by status"
        >
          <option value="all">All Statuses</option>
          {statuses.map((orderStatus) => (
            <option key={orderStatus} value={orderStatus}>
              {orderStatus}
            </option>
          ))}
        </select>
      </div>

      {filteredOrders.length === 0 ? (
        <Empty text="No sales orders match your filters." />
      ) : (
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
              {filteredOrders.map((order) => (
                <tr key={order.order_id}>
                  <td>#{order.order_id}</td>
                  <td>{date(order.order_date)}</td>
                  <td>{order.status}</td>
                  <td>{number(order.total_quantity)}</td>
                  <td>{money(order.total_amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}