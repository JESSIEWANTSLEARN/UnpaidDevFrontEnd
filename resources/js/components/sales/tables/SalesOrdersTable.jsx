import React, { useState } from "react";
import { SalesEmpty } from "../common/SalesDashboardPrimitives.jsx";
import {
  formatDate,
  formatMoney,
  formatNumber,
} from "../utils/salesFormatters.js";

function actionList(order) {
  if (order.status === "PENDING") {
    return [
      ["process", "Process"],
      ["unfulfill", "Mark Unfulfilled"],
      ["cancel", "Cancel"],
    ];
  }

  if (order.status === "PROCESSING") {
    return [
      ["fulfill", "Fulfill"],
      ["unfulfill", "Mark Unfulfilled"],
      ["cancel", "Cancel"],
    ];
  }

  return [];
}

export default function SalesOrdersTable({
  orders,
  previewMode,
  busy,
  onStatus,
}) {
  const [expanded, setExpanded] = useState(null);

  if (!orders.length) {
    return <SalesEmpty text="No orders found." />;
  }

  return (
    <div className="sales-role-table-wrap">
      <table className="sales-role-table">
        <thead>
          <tr>
            <th>Order</th>
            <th>Customer</th>
            <th>Date</th>
            <th>Units</th>
            <th>Total</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
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
                  <td colSpan="7">
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
  );
}
