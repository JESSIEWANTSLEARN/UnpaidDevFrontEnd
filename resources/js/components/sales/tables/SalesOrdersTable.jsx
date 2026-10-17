import React, { useMemo, useState } from "react";
import { SalesEmpty } from "../common/SalesDashboardPrimitives.jsx";
import {
  formatDate,
  formatMoney,
  formatNumber,
} from "../utils/salesFormatters.js";

function actionList(order) {
  const actions = [];
  const prepaid =
    order.payment_method &&
    order.payment_method !== "CASH_ON_DELIVERY";
  const paymentReady =
    !prepaid || order.payment_status === "PAID";

  if (
    prepaid &&
    order.payment_status === "AWAITING_VERIFICATION"
  ) {
    actions.push([
      "verify_payment",
      "Verify Payment",
    ]);
  }

  if (order.status === "PENDING") {
    if (paymentReady) {
      actions.push(["process", "Process"]);
    }

    actions.push(
      ["unfulfill", "Mark Unfulfilled"],
      ["cancel", "Cancel"],
    );

    return actions;
  }

  if (order.status === "PROCESSING") {
    actions.push(
      ["fulfill", "Fulfill"],
      ["unfulfill", "Mark Unfulfilled"],
      ["cancel", "Cancel"],
    );
  }

  return actions;
}

export default function SalesOrdersTable({
  orders,
  previewMode,
  busy,
  onStatus,
  showFilters = true,
}) {
  const [expanded, setExpanded] = useState(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");

  const statuses = useMemo(
    () => [...new Set((orders || []).map((order) => order.status).filter(Boolean))].sort(),
    [orders],
  );

  const filteredOrders = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return (orders || []).filter((order) => {
      const statusMatches = status === "all" || order.status === status;
      const searchMatches = !needle || [
        order.order_id,
        order.customer_name,
        order.customer_email,
        order.customer_contact,
        order.order_date,
        order.status,
        order.payment_method,
        order.payment_status,
        order.payment_reference_number,
      ].some((value) => String(value ?? "").toLowerCase().includes(needle));
      return statusMatches && searchMatches;
    });
  }, [orders, search, status]);

  if (!orders.length) {
    return <SalesEmpty text="No orders found." />;
  }

  return (
    <>
      {showFilters && <div className="role-live-filter-bar" role="search">
        <div className="role-live-search-wrap">
          <input
            className="role-live-search-input"
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search order, customer, payment..."
            aria-label="Search sales orders"
          />
          {search && (
            <button className="role-live-search-clear" type="button" onClick={() => setSearch("")}>
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
          <option value="all">All statuses</option>
          {statuses.map((value) => <option key={value} value={value}>{value}</option>)}
        </select>
      </div>}

      {filteredOrders.length === 0 ? (
        <SalesEmpty text="No orders match your search and filter." />
      ) : (
      <div className="sales-role-table-wrap">
      <table className="sales-role-table">
        <thead>
          <tr>
            <th>Order</th>
            <th>Customer</th>
            <th>Date</th>
            <th>Units</th>
            <th>Total</th>
            <th>Payment</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredOrders.map((order) => (
            <React.Fragment key={order.order_id}>
              <tr>
                <td>#{order.order_id}</td>
                <td>
                  <strong>{order.customer_name}</strong>
                  <small>
                    {order.customer_email ||
                      order.customer_contact ||
                      "-"}
                  </small>
                </td>
                <td>{formatDate(order.order_date)}</td>
                <td>
                  {formatNumber(order.total_quantity)}
                </td>
                <td>{formatMoney(order.total_amount)}</td>
                <td>
                  <strong>
                    {String(
                      order.payment_method ||
                        "CASH_ON_DELIVERY",
                    ).replaceAll("_", " ")}
                  </strong>
                  <small>
                    {String(
                      order.payment_status || "PENDING",
                    ).replaceAll("_", " ")}
                  </small>
                  {order.payment_reference_number && (
                    <small>
                      Ref: {order.payment_reference_number}
                    </small>
                  )}
                </td>
                <td>
                  <span
                    className={`sales-status status-${String(
                      order.status,
                    ).toLowerCase()}`}
                  >
                    {order.status}
                  </span>
                </td>
                <td>
                  <div className="sales-role-actions">
                    <button
                      type="button"
                      className="sales-role-secondary"
                      onClick={() =>
                        setExpanded(
                          expanded === order.order_id
                            ? null
                            : order.order_id,
                        )
                      }
                    >
                      {expanded === order.order_id
                        ? "Hide Items"
                        : "View Items"}
                    </button>

                    {previewMode ? (
                      <span className="sales-role-muted">
                        Read only
                      </span>
                    ) : (
                      actionList(order).map(
                        ([action, label]) => (
                          <button
                            type="button"
                            key={action}
                            disabled={busy}
                            className={
                              action === "cancel" ||
                              action === "unfulfill"
                                ? "sales-role-danger"
                                : "sales-role-primary"
                            }
                            onClick={() =>
                              onStatus(
                                order.order_id,
                                action,
                              )
                            }
                          >
                            {label}
                          </button>
                        ),
                      )
                    )}
                  </div>
                </td>
              </tr>

              {expanded === order.order_id && (
                <tr className="sales-role-items-row">
                  <td colSpan="8">
                    <div className="sales-role-items">
                      {(order.items || []).length ? (
                        order.items.map((item) => (
                          <div
                            key={item.order_detail_id}
                            className="sales-role-item"
                          >
                            <div>
                              <strong>
                                {item.product_name}
                              </strong>
                              <span>{item.sku}</span>
                            </div>

                            <span>
                              {item.quantity} x{" "}
                              {formatMoney(item.unit_price)}
                            </span>

                            <strong>
                              {formatMoney(item.line_total)}
                            </strong>
                          </div>
                        ))
                      ) : (
                        <SalesEmpty text="No order items." />
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>
      </div>
      )}
    </>
  );
}
