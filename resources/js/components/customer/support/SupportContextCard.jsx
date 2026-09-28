import React from "react";
import { money } from "../../../utils/customer/customerStoreUtils.js";
import { StatusBadge } from "../CustomerUi.jsx";

export default function SupportContextCard({
  context,
  onClear,
}) {
  if (!context?.value) return null;

  if (context.type === "order") {
    const order = context.value;

    return (
      <div className="wbo-support-context-card">
        <div>
          <span>ORDER INQUIRY</span>
          <strong>Order #{order.order_id}</strong>
          <small>{money(order.total ?? order.total_amount)}</small>
          <StatusBadge status={order.status} />
        </div>

        <button type="button" onClick={onClear}>
          Change
        </button>
      </div>
    );
  }

  const product = context.value;

  return (
    <div className="wbo-support-context-card">
      {product.image_url && (
        <img src={product.image_url} alt="" />
      )}

      <div>
        <span>PRODUCT INQUIRY</span>
        <strong>{product.name}</strong>
        <small>
          {product.sku || "N/A"} - {money(product.unit_price)}
        </small>
        <small>
          {Number(product.available_stock || 0)} in stock
        </small>
      </div>

      <button type="button" onClick={onClear}>
        Change
      </button>
    </div>
  );
}