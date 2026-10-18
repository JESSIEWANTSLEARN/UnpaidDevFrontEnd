// Merge authoritative inventory responses without discarding unrelated dashboard data or UI state.
const id = (value) => String(value);
const number = (value) => Number(value || 0);

function mergeRows(rows = [], updates = [], key) {
  const incoming = new Map(updates.map((row) => [id(row[key]), row]));
  const result = rows.map((row) => {
    const patch = incoming.get(id(row[key]));
    incoming.delete(id(row[key]));
    return patch ? { ...row, ...patch } : row;
  });
  return [...result, ...incoming.values()];
}

const newestBatch = (a, b) => String(b.received_date || "").localeCompare(String(a.received_date || "")) || number(b.batch_id) - number(a.batch_id);
const openStatuses = new Set(["DRAFT", "PENDING_APPROVAL", "APPROVED", "ORDERED", "PARTIALLY_RECEIVED"]);
const uniqueOrders = (rows, predicate) => new Set(rows.filter(predicate).map((row) => id(row.po_id))).size;

function operationalAlerts(metrics) {
  const alerts = [];
  const add = (key, tone, title, message) => {
    if (number(metrics[key]) > 0) alerts.push({ tone, title, message: message(number(metrics[key])) });
  };
  add("out_of_stock", "danger", "Out of Stock", (n) => `${n} product(s) currently have no available stock.`);
  add("low_stock_items", "warning", "Low Stock", (n) => `${n} product(s) are at or below their configured reorder point.`);
  add("pending_approval_pos", "warning", "Purchase Orders Awaiting Approval", (n) => `${n} purchase order(s) require Purchasing Manager review.`);
  add("expiring_batches", "warning", "Expiry Watch", (n) => `${n} stocked batch(es) expire within 30 days.`);
  add("open_purchase_orders", "info", "Open Purchase Orders", (n) => `${n} purchase order(s) remain open.`);
  add("pending_orders", "info", "Pending Sales Orders", (n) => `${n} customer order(s) are pending.`);
  return alerts;
}

export function applyInventoryUpdate(current, update) {
  if (!current || !update || !Array.isArray(update.product_stocks)) return current;
  const stocks = new Map(update.product_stocks.map((row) => [id(row.product_id), row]));
  const products = (current.products || []).map((product) => {
    const stock = stocks.get(id(product.product_id));
    if (!stock) return product;
    const available = number(stock.available_stock);
    const result = { ...product, available_stock: available };
    if (Object.hasOwn(product, "recommended_reorder_quantity")) {
      const threshold = Math.max(1, number(product.reorder_point));
      result.recommended_reorder_quantity = available <= threshold ? Math.max(threshold * 2 - available, 1) : 0;
    }
    return result;
  });
  const operational = Object.hasOwn(current, "role");
  let batches = mergeRows(current.batches, update.batches, "batch_id").sort(newestBatch);
  if (operational) batches = batches.slice(0, 100); // Preserve the staff dashboard's existing window.
  const transactions = update.transactions ?? current.transactions;
  const metrics = { ...current.metrics, ...update.metrics };
  const next = { ...current, products, batches, transactions, metrics };

  if (update.purchase_orders) {
    const affected = new Set((update.purchase_order_ids || []).map(id));
    let orders = [...(current.purchase_orders || []).filter((row) => !affected.has(id(row.po_id))), ...update.purchase_orders]
      .sort((a, b) => String(b.created_at || "").localeCompare(String(a.created_at || "")) || number(b.po_id) - number(a.po_id));
    if (operational) orders = orders.slice(0, 100);
    next.purchase_orders = orders;
    metrics.open_purchase_orders = uniqueOrders(orders, (row) => openStatuses.has(row.status));
    if (operational) {
      metrics.pending_approval_pos = uniqueOrders(orders, (row) => row.status === "PENDING_APPROVAL");
      metrics.ordered_pos = uniqueOrders(orders, (row) => row.status === "ORDERED");
    }
  }
  if (update.categories) next.categories = mergeRows(current.categories, update.categories, "category_id");
  for (const key of ["notifications", "audit_logs", "stock_trend"]) {
    if (update[key] !== undefined) next[key] = update[key];
  }

  if (operational) {
    const reorder = products.filter((p) => number(p.available_stock) <= Math.max(1, number(p.reorder_point)));
    next.low_stock_products = reorder.filter((p) => number(p.available_stock) > 0);
    next.out_of_stock_products = products.filter((p) => number(p.available_stock) <= 0);
    next.reorder_needs = [...reorder].sort((a, b) => number(a.available_stock) - number(b.available_stock));
    if (update.today && update.expiry_cutoff) {
      next.expiring_batches = batches.filter((batch) => {
        const expiry = String(batch.expiry_date || "").slice(0, 10);
        return number(batch.current_quantity) > 0 && expiry >= update.today && expiry <= update.expiry_cutoff;
      });
      metrics.expiring_batches = next.expiring_batches.length;
      const today = (transactions || []).filter((row) => String(row.timestamp || "").slice(0, 10) >= update.today);
      metrics.stock_movements_today = today.length;
      metrics.receipts_today = today.filter((row) => row.transaction_type === "RECEIVE").length;
    }
    metrics.reorder_needs = next.reorder_needs.length;
    next.alerts = operationalAlerts(metrics);
  }
  return next;
}
