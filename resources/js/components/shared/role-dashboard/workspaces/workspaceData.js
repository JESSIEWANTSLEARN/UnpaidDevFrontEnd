export const list = (value) => (Array.isArray(value) ? value : []);
export const numeric = (value) =>
  Number.isFinite(Number(value)) ? Number(value) : 0;
export const outstanding = (po) =>
  Math.max(0, numeric(po.quantity_ordered) - numeric(po.quantity_received));
export const incoming = (po) =>
  ["ORDERED", "PARTIALLY_RECEIVED"].includes(po.status);
export const uniquePOCount = (rows) => new Set(rows.map((po) => po.po_id)).size;

// Compare date-only strings as calendar days; avoid local midnight/UTC shifts.
export function manilaDay(now = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Manila",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const part = (type) => parts.find((p) => p.type === type).value;
  return `${part("year")}-${part("month")}-${part("day")}`;
}
export function dayNumber(value) {
  const day = String(value || "").slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) return null;
  const parsed = Date.parse(`${day}T00:00:00Z`);
  if (
    !Number.isFinite(parsed) ||
    new Date(parsed).toISOString().slice(0, 10) !== day
  )
    return null;
  return parsed / 86400000;
}
export function expiryGroup(batch, today = manilaDay()) {
  if (numeric(batch.current_quantity) <= 0) return "Empty";
  const expiry = dayNumber(batch.expiry_date);
  if (expiry === null)
    return batch.expiry_date ? "Invalid date" : "No expiry date";
  const days = expiry - dayNumber(today);
  return days < 0
    ? "Expired"
    : days <= 7
      ? "Within 7 days"
      : days <= 30
        ? "8–30 days"
        : "Later";
}
export function salesStage(order) {
  if (!["PENDING", "PROCESSING"].includes(order.status)) return null;
  if (order.status === "PROCESSING") return "Ready to fulfill";
  const prepaid =
    order.payment_method && order.payment_method !== "CASH_ON_DELIVERY";
  if (prepaid && order.payment_status === "AWAITING_VERIFICATION")
    return "Verify payment";
  if (prepaid && order.payment_status !== "PAID") return "Awaiting payment";
  return "Ready to process";
}
export function accountReasons(user) {
  const reasons = [];
  if (!user.email_verified_at) reasons.push("Unverified email");
  if (user.account_status !== "active" && numeric(user.active_sessions) > 0)
    reasons.push("Inactive with sessions");
  if (numeric(user.active_sessions) > 1) reasons.push("Multiple sessions");
  return reasons;
}
export function procurementPlan(data) {
  return list(data.reorder_needs)
    .map((product) => {
      const rows = list(data.purchase_orders).filter(
        (po) =>
          String(po.product_id) === String(product.product_id) && incoming(po),
      );
      const incomingQuantity = rows.reduce(
        (sum, po) => sum + outstanding(po),
        0,
      );
      const suggested = numeric(product.recommended_reorder_quantity);
      return {
        ...product,
        incomingQuantity,
        planningGap: Math.max(0, suggested - incomingQuantity),
      };
    })
    .sort(
      (a, b) =>
        b.planningGap - a.planningGap ||
        numeric(a.available_stock) - numeric(b.available_stock),
    );
}
export function datedOrders(orders, from, to) {
  return list(orders).filter((order) => {
    const day = String(order.order_date || "").slice(0, 10);
    if (!from && !to) return true;
    return (
      dayNumber(day) !== null && (!from || day >= from) && (!to || day <= to)
    );
  });
}
export function salesOutcomes(orders) {
  const groups = new Map();
  for (const order of orders) {
    const status = order.status || "Unknown";
    const row = groups.get(status) || { status, count: 0, units: 0, amount: 0 };
    row.count += 1;
    row.units += numeric(order.total_quantity);
    row.amount += numeric(order.total_amount);
    groups.set(status, row);
  }
  return [...groups.values()];
}
