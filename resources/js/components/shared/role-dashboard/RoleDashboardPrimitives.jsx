import React from "react";

// Shared role-dashboard presentation primitives.
// These components intentionally contain no API calls or role state.

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
    <div className="role-live-empty">
      {text}
    </div>
  );
}

export function Metrics({
  metrics = {},
  roleKey,
}) {
  const base = [
    ["Products", metrics.total_products],
    ["Available Stock", metrics.total_stock],
    ["Low Stock", metrics.low_stock_items],
    ["Out of Stock", metrics.out_of_stock],
    ["Open POs", metrics.open_purchase_orders],
  ];

  const purchasing = [
    [
      "Awaiting Approval",
      metrics.pending_approval_pos,
    ],
    ["Ordered POs", metrics.ordered_pos],
    [
      "Active Suppliers",
      metrics.active_suppliers,
    ],
    [
      "Reorder Needs",
      metrics.reorder_needs,
    ],
  ];

  const operations = [
    ["Pending Orders", metrics.pending_orders],
    [
      "Movements Today",
      metrics.stock_movements_today,
    ],
    ["Receipts Today", metrics.receipts_today],
    ["Expiry Watch", metrics.expiring_batches],
  ];

  const cards =
    roleKey === "Purchasing_Manager" ||
    roleKey === "Purchasing_Staff"
      ? [...base, ...purchasing]
      : [...base, ...operations];

  return (
    <div className="role-live-metrics">
      {cards.map(([label, value]) => (
        <article
          className="role-live-metric"
          key={label}
        >
          <span>{label}</span>
          <strong>{number(value)}</strong>
        </article>
      ))}
    </div>
  );
}

export function Alerts({ alerts = [] }) {
  if (!alerts.length) {
    return (
      <Empty text="No current operational alerts." />
    );
  }

  return (
    <div className="role-live-alerts">
      {alerts.map((alert, index) => (
        <article
          key={`${alert.title}-${index}`}
          className={`role-live-alert tone-${alert.tone || "info"}`}
        >
          <strong>{alert.title}</strong>
          <p>{alert.message}</p>
        </article>
      ))}
    </div>
  );
}

export function ProductsTable({
  products = [],
}) {
  if (!products.length) {
    return <Empty text="No products found." />;
  }

  return (
    <div className="role-live-table-wrap">
      <table className="role-live-table">
        <thead>
          <tr>
            <th>SKU</th>
            <th>Product</th>
            <th>Category</th>
            <th>Supplier</th>
            <th>Available</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.product_id}>
              <td>{product.sku}</td>
              <td>{product.name}</td>
              <td>{product.category}</td>
              <td>
                {product.supplier_name || "-"}
              </td>
              <td>
                {number(product.available_stock)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function SuppliersTable({
  suppliers = [],
  previewMode,
  onEdit,
}) {
  if (!suppliers.length) {
    return <Empty text="No suppliers found." />;
  }

  return (
    <div className="role-live-table-wrap">
      <table className="role-live-table">
        <thead>
          <tr>
            <th>Supplier</th>
            <th>Status</th>
            <th>Contact</th>
            <th>Email</th>
            <th>Lead Time</th>
            <th>Products</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {suppliers.map((supplier) => (
            <tr key={supplier.supplier_id}>
              <td>{supplier.name}</td>
              <td>
                {supplier.supplier_status}
              </td>
              <td>
                {supplier.contact_number ||
                  "-"}
              </td>
              <td>{supplier.email || "-"}</td>
              <td>
                {number(
                  supplier.lead_time_days,
                )}{" "}
                day(s)
              </td>
              <td>
                {number(
                  supplier.product_count,
                )}
              </td>
              <td>
                <button
                  type="button"
                  className="role-live-table-action"
                  disabled={previewMode}
                  onClick={() =>
                    onEdit(supplier)
                  }
                >
                  {previewMode
                    ? "Read only"
                    : "Edit"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function BatchesTable({ batches = [] }) {
  if (!batches.length) {
    return (
      <Empty text="No inventory batches found." />
    );
  }

  return (
    <div className="role-live-table-wrap">
      <table className="role-live-table">
        <thead>
          <tr>
            <th>Batch</th>
            <th>Product</th>
            <th>SKU</th>
            <th>Received</th>
            <th>Current</th>
            <th>Received Date</th>
            <th>Expiry</th>
          </tr>
        </thead>
        <tbody>
          {batches.map((batch) => (
            <tr key={batch.batch_id}>
              <td>{batch.batch_number}</td>
              <td>{batch.product_name}</td>
              <td>{batch.sku}</td>
              <td>
                {number(
                  batch.quantity_received,
                )}
              </td>
              <td>
                {number(
                  batch.current_quantity,
                )}
              </td>
              <td>
                {date(batch.received_date)}
              </td>
              <td>{date(batch.expiry_date)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function TransactionsTable({
  transactions = [],
}) {
  if (!transactions.length) {
    return (
      <Empty text="No stock movements found." />
    );
  }

  return (
    <div className="role-live-table-wrap">
      <table className="role-live-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Type</th>
            <th>Batch</th>
            <th>Product</th>
            <th>Change</th>
            <th>Performed By</th>
            <th>Reference</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map(
            (transaction) => (
              <tr
                key={
                  transaction.transaction_id
                }
              >
                <td>
                  {date(
                    transaction.timestamp,
                  )}
                </td>
                <td>
                  {
                    transaction.transaction_type
                  }
                </td>
                <td>
                  {
                    transaction.batch_number
                  }
                </td>
                <td>
                  {
                    transaction.product_name
                  }
                </td>
                <td>
                  {transaction.quantity_change >
                  0
                    ? "+"
                    : ""}
                  {number(
                    transaction.quantity_change,
                  )}
                </td>
                <td>
                  {transaction.performed_by ||
                    "-"}
                </td>
                <td>
                  {transaction.reference_note ||
                    "-"}
                </td>
              </tr>
            ),
          )}
        </tbody>
      </table>
    </div>
  );
}

export function PurchaseOrdersTable({
  purchaseOrders = [],
  roleKey,
  previewMode,
  currentUserId,
  busy,
  onStatus,
  approvalsOnly = false,
}) {
  const rows = approvalsOnly
    ? purchaseOrders.filter(
        (po) =>
          po.status ===
          "PENDING_APPROVAL",
      )
    : purchaseOrders;

  if (!rows.length) {
    return (
      <Empty
        text={
          approvalsOnly
            ? "No purchase orders are awaiting approval."
            : "No purchase orders found."
        }
      />
    );
  }

  const manager =
    roleKey === "Purchasing_Manager";

  const actionsFor = (po) => {
    if (previewMode) return [];

    const actions = [];

    if (po.status === "DRAFT") {
      if (
        manager ||
        Number(po.created_by_user_id) ===
          Number(currentUserId)
      ) {
        actions.push([
          "submit",
          "Submit",
        ]);
      }
    }

    if (
      manager &&
      po.status === "PENDING_APPROVAL"
    ) {
      actions.push([
        "approve",
        "Approve",
      ]);
    }

    if (
      manager &&
      po.status === "APPROVED"
    ) {
      actions.push([
        "order",
        "Mark Ordered",
      ]);
    }

    if (
      manager &&
      ![
        "RECEIVED",
        "PARTIALLY_RECEIVED",
        "CANCELLED",
      ].includes(po.status)
    ) {
      actions.push([
        "cancel",
        "Cancel",
      ]);
    }

    return actions;
  };

  return (
    <div className="role-live-table-wrap">
      <table className="role-live-table">
        <thead>
          <tr>
            <th>PO</th>
            <th>Supplier</th>
            <th>Product</th>
            <th>Ordered</th>
            <th>Received</th>
            <th>Cost</th>
            <th>Status</th>
            <th>Created By</th>
            <th>Approved By</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((po, index) => (
            <tr
              key={`${po.po_id}-${po.po_detail_id || index}`}
            >
              <td>{po.po_number}</td>
              <td>{po.supplier_name}</td>
              <td>
                {po.product_name || "-"}
              </td>
              <td>
                {number(
                  po.quantity_ordered,
                )}
              </td>
              <td>
                {number(
                  po.quantity_received,
                )}
              </td>
              <td>{money(po.unit_cost)}</td>
              <td>{po.status}</td>
              <td>{po.created_by || "-"}</td>
              <td>{po.approved_by || "-"}</td>
              <td>
                <div className="role-live-inline-actions">
                  {previewMode && (
                    <span className="role-live-muted">
                      Read only
                    </span>
                  )}

                  {actionsFor(po).map(
                    ([action, label]) => (
                      <button
                        key={action}
                        type="button"
                        className={
                          action === "cancel"
                            ? "role-live-danger-action"
                            : "role-live-table-action"
                        }
                        disabled={busy}
                        onClick={() =>
                          onStatus(
                            po.po_id,
                            action,
                          )
                        }
                      >
                        {label}
                      </button>
                    ),
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function OrdersTable({ orders = [] }) {
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

export function Section({
  title,
  description,
  children,
}) {
  return (
    <section className="role-live-panel">
      <header className="role-live-section-head">
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
