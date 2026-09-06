import React, {
  useMemo,
  useState,
} from "react";
import "../../../css/sales/sales-dashboard.css";

/* WBO_ROLE_SALES_CONTENT_V1 */

const number = (value) =>
  Number(value || 0).toLocaleString();

const money = (value) =>
  new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
  }).format(Number(value || 0));

const date = (value) => {
  if (!value) return "-";

  const parsed = new Date(value);

  return Number.isNaN(parsed.getTime())
    ? String(value)
    : parsed.toLocaleString();
};

function Empty({ text }) {
  return (
    <div className="sales-role-empty">
      {text}
    </div>
  );
}

function Section({
  title,
  description,
  children,
}) {
  return (
    <section className="sales-role-panel">
      <header className="sales-role-head">
        <div>
          <h2>{title}</h2>
          {description && (
            <p>{description}</p>
          )}
        </div>
      </header>
      {children}
    </section>
  );
}

function Metrics({
  metrics = {},
  manager,
}) {
  const cards = [
    [
      "Pending",
      metrics.pending_orders,
    ],
    [
      "Processing",
      metrics.processing_orders,
    ],
    [
      "Fulfilled",
      metrics.fulfilled_orders,
    ],
    [
      "Unfulfilled",
      metrics.unfulfilled_orders,
    ],
    [
      "Customers",
      metrics.customers,
    ],
  ];

  if (manager) {
    cards.push(
      [
        "Monthly Revenue",
        money(
          metrics.monthly_revenue,
        ),
      ],
      [
        "Monthly Fulfilled",
        metrics.monthly_fulfilled,
      ],
    );
  }

  return (
    <div className="sales-role-metrics">
      {cards.map(([label, value]) => (
        <article
          className="sales-role-metric"
          key={label}
        >
          <span>{label}</span>
          <strong>
            {typeof value === "number"
              ? number(value)
              : value}
          </strong>
        </article>
      ))}
    </div>
  );
}

function Alerts({ alerts = [] }) {
  if (!alerts.length) {
    return (
      <Empty text="No current sales alerts." />
    );
  }

  return (
    <div className="sales-role-alerts">
      {alerts.map((alert, index) => (
        <article
          className={`sales-role-alert tone-${alert.tone || "info"}`}
          key={`${alert.title}-${index}`}
        >
          <strong>{alert.title}</strong>
          <p>{alert.message}</p>
        </article>
      ))}
    </div>
  );
}

function actionList(order) {
  if (order.status === "PENDING") {
    return [
      ["process", "Process"],
      [
        "unfulfill",
        "Mark Unfulfilled",
      ],
      ["cancel", "Cancel"],
    ];
  }

  if (
    order.status === "PROCESSING"
  ) {
    return [
      ["fulfill", "Fulfill"],
      [
        "unfulfill",
        "Mark Unfulfilled",
      ],
      ["cancel", "Cancel"],
    ];
  }

  return [];
}

function OrdersTable({
  orders,
  previewMode,
  busy,
  onStatus,
}) {
  const [expanded, setExpanded] =
    useState(null);

  if (!orders.length) {
    return <Empty text="No orders found." />;
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
            <React.Fragment
              key={order.order_id}
            >
              <tr>
                <td>
                  #{order.order_id}
                </td>
                <td>
                  <strong>
                    {
                      order.customer_name
                    }
                  </strong>
                  <small>
                    {order.customer_email ||
                      order.customer_contact ||
                      "-"}
                  </small>
                </td>
                <td>
                  {date(
                    order.order_date,
                  )}
                </td>
                <td>
                  {number(
                    order.total_quantity,
                  )}
                </td>
                <td>
                  {money(
                    order.total_amount,
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
                          expanded ===
                            order.order_id
                            ? null
                            : order.order_id,
                        )
                      }
                    >
                      {expanded ===
                      order.order_id
                        ? "Hide Items"
                        : "View Items"}
                    </button>

                    {previewMode ? (
                      <span className="sales-role-muted">
                        Read only
                      </span>
                    ) : (
                      actionList(
                        order,
                      ).map(
                        ([
                          action,
                          label,
                        ]) => (
                          <button
                            type="button"
                            key={action}
                            disabled={
                              busy
                            }
                            className={
                              action ===
                                "cancel" ||
                              action ===
                                "unfulfill"
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

              {expanded ===
                order.order_id && (
                <tr className="sales-role-items-row">
                  <td colSpan="7">
                    <div className="sales-role-items">
                      {(order.items || [])
                        .length ? (
                        order.items.map(
                          (item) => (
                            <div
                              key={
                                item.order_detail_id
                              }
                              className="sales-role-item"
                            >
                              <div>
                                <strong>
                                  {
                                    item.product_name
                                  }
                                </strong>
                                <span>
                                  {
                                    item.sku
                                  }
                                </span>
                              </div>

                              <span>
                                {
                                  item.quantity
                                }{" "}
                                x{" "}
                                {money(
                                  item.unit_price,
                                )}
                              </span>

                              <strong>
                                {money(
                                  item.line_total,
                                )}
                              </strong>
                            </div>
                          ),
                        )
                      ) : (
                        <Empty text="No order items." />
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

function CustomersTable({
  customers,
}) {
  if (!customers.length) {
    return (
      <Empty text="No System User customers found." />
    );
  }

  return (
    <div className="sales-role-table-wrap">
      <table className="sales-role-table">
        <thead>
          <tr>
            <th>Customer</th>
            <th>Contact</th>
            <th>Status</th>
            <th>Orders</th>
            <th>Fulfilled</th>
            <th>Total Spent</th>
            <th>Last Order</th>
          </tr>
        </thead>
        <tbody>
          {customers.map(
            (customer) => (
              <tr
                key={
                  customer.user_id
                }
              >
                <td>
                  <strong>
                    {customer.name}
                  </strong>
                  <small>
                    {customer.email}
                  </small>
                </td>
                <td>
                  {
                    customer.contact_number ||
                    "-"
                  }
                </td>
                <td>
                  {
                    customer.account_status
                  }
                </td>
                <td>
                  {number(
                    customer.order_count,
                  )}
                </td>
                <td>
                  {number(
                    customer.fulfilled_orders,
                  )}
                </td>
                <td>
                  {money(
                    customer.total_spent,
                  )}
                </td>
                <td>
                  {date(
                    customer.last_order_at,
                  )}
                </td>
              </tr>
            ),
          )}
        </tbody>
      </table>
    </div>
  );
}

function ProductPerformanceTable({
  rows,
}) {
  if (!rows.length) {
    return (
      <Empty text="No fulfilled sales yet." />
    );
  }

  return (
    <div className="sales-role-table-wrap">
      <table className="sales-role-table">
        <thead>
          <tr>
            <th>SKU</th>
            <th>Product</th>
            <th>Units Sold</th>
            <th>Orders</th>
            <th>Revenue</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.product_id}>
              <td>{row.sku}</td>
              <td>{row.name}</td>
              <td>
                {number(
                  row.units_sold,
                )}
              </td>
              <td>
                {number(
                  row.order_count,
                )}
              </td>
              <td>
                {money(
                  row.revenue,
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function AvailabilityTable({
  products,
  threshold,
}) {
  if (!products.length) {
    return (
      <Empty text="No products found." />
    );
  }

  return (
    <div className="sales-role-table-wrap">
      <table className="sales-role-table">
        <thead>
          <tr>
            <th>SKU</th>
            <th>Product</th>
            <th>Category</th>
            <th>Price</th>
            <th>Available</th>
            <th>Condition</th>
          </tr>
        </thead>
        <tbody>
          {products.map(
            (product) => {
              const stock =
                Number(
                  product.available_stock ||
                    0,
                );

              const condition =
                stock <= 0
                  ? "OUT"
                  : stock <=
                      threshold
                    ? "LOW"
                    : "OK";

              return (
                <tr
                  key={
                    product.product_id
                  }
                >
                  <td>
                    {product.sku}
                  </td>
                  <td>
                    {product.name}
                  </td>
                  <td>
                    {
                      product.category
                    }
                  </td>
                  <td>
                    {money(
                      product.unit_price,
                    )}
                  </td>
                  <td>
                    {number(stock)}
                  </td>
                  <td>
                    <span
                      className={`sales-stock stock-${condition.toLowerCase()}`}
                    >
                      {condition}
                    </span>
                  </td>
                </tr>
              );
            },
          )}
        </tbody>
      </table>
    </div>
  );
}

export default function SalesDashboardContent({
  roleKey,
  activeModule,
  data,
  previewMode,
  busy,
  onOrderStatus,
}) {
  const manager =
    roleKey === "Sales_Manager";

  const openOrders = useMemo(
    () =>
      (data.orders || []).filter(
        (order) =>
          order.status ===
            "PENDING" ||
          order.status ===
            "PROCESSING",
      ),
    [data.orders],
  );

  if (
    activeModule === "Overview" ||
    activeModule ===
      (manager
        ? "Sales Overview"
        : "Sales Tasks")
  ) {
    return (
      <>
        <Metrics
          metrics={data.metrics}
          manager={manager}
        />

        <Section
          title="Sales Alerts"
          description="Current order backlog and fulfillment risks."
        >
          <Alerts alerts={data.alerts} />
        </Section>

        <Section
          title="Orders Requiring Action"
          description="Pending orders need review; processing orders already have inventory reserved."
        >
          <OrdersTable
            orders={openOrders}
            previewMode={previewMode}
            busy={busy}
            onStatus={onOrderStatus}
          />
        </Section>
      </>
    );
  }

  if (activeModule === "Orders") {
    return (
      <Section
        title="Customer Orders"
        description="PENDING -> PROCESSING reserves inventory using FEFO. FULFILLED converts that reservation into the completed sale."
      >
        <OrdersTable
          orders={data.orders || []}
          previewMode={previewMode}
          busy={busy}
          onStatus={onOrderStatus}
        />
      </Section>
    );
  }

  if (activeModule === "Customers") {
    return (
      <Section
        title="Customers"
        description="Customer contact and sales history are visible here; account administration remains with User Admin."
      >
        <CustomersTable
          customers={
            data.customers || []
          }
        />
      </Section>
    );
  }

  if (
    manager &&
    activeModule ===
      "Product Performance"
  ) {
    return (
      <Section
        title="Product Performance"
        description="Fulfilled-order units and revenue only."
      >
        <ProductPerformanceTable
          rows={
            data.product_performance ||
            []
          }
        />
      </Section>
    );
  }

  if (
    manager &&
    activeModule ===
      "Sales Alerts"
  ) {
    return (
      <Section
        title="Sales Alerts"
        description="Order-processing exceptions and fulfillment stock risks."
      >
        <Alerts alerts={data.alerts} />
      </Section>
    );
  }

  if (
    !manager &&
    activeModule ===
      "Product Availability"
  ) {
    return (
      <Section
        title="Product Availability"
        description="Live available stock after any active sales reservations."
      >
        <AvailabilityTable
          products={data.products || []}
          threshold={
            data.low_stock_threshold ||
            10
          }
        />
      </Section>
    );
  }

  return (
    <Section
      title={activeModule}
      description="No sales content is configured for this section."
    >
      <Empty text="Nothing to display." />
    </Section>
  );
}