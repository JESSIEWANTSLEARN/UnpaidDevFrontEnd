import React from "react";
import { money } from "../../../utils/customer/customerStoreUtils.js";
import { StatusBadge } from "../CustomerUi.jsx";

export default function SupportContextCard({
  context,
  onClear,
  onOpen,
}) {
  if (!context?.value) return null;

  if (context.type === "order") {
    const order = context.value;

    return (
      <div className="wbo-support-context-card is-order">
        <button
          type="button"
          className="wbo-support-context-main"
          onClick={onOpen}
          title="Open this order"
        >
          <div className="wbo-support-context-icon">
            ORD
          </div>

          <div className="wbo-support-context-copy">
            <span>ORDER ATTACHED</span>
            <strong>Order #{order.order_id}</strong>
            <small>
              {money(order.total ?? order.total_amount)}
            </small>
            <StatusBadge status={order.status} />
            <em>View order</em>
          </div>
        </button>

        <button
          type="button"
          className="wbo-support-context-change"
          onClick={onClear}
        >
          Change
        </button>
      </div>
    );
  }

  const product = context.value;

  return (
    <div className="wbo-support-context-card is-product">
      <button
        type="button"
        className="wbo-support-context-main"
        onClick={onOpen}
        title="Open this product"
      >
        <div className="wbo-support-context-media">
          {product.image_url ? (
            <img src={product.image_url} alt="" />
          ) : (
            <span>WB</span>
          )}
        </div>

        <div className="wbo-support-context-copy">
          <span>PRODUCT ATTACHED</span>
          <strong>{product.name}</strong>
          <b>{money(product.unit_price)}</b>
          <small>
            {product.sku || "N/A"} -{" "}
            {Number(product.available_stock || 0)} in stock
          </small>
          <em>View product details</em>
        </div>
      </button>

      <button
        type="button"
        className="wbo-support-context-change"
        onClick={onClear}
      >
        Change
      </button>
    </div>
  );
}