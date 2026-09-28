import React from "react";
import { money } from "../../../utils/customer/customerStoreUtils.js";
import { Icon, StatusBadge } from "../CustomerUi.jsx";

export default function SupportContextPicker({
  mode,
  orders,
  products,
  onSelect,
  onClose,
}) {
  if (!mode) return null;

  return (
    <div className="wbo-support-picker">
      <div className="wbo-support-picker-head">
        <div>
          <strong>
            {mode === "orders"
              ? "Select an order"
              : "Select a product"}
          </strong>
          <small>
            {mode === "orders"
              ? "Choose the order you want to ask about."
              : "Choose the product you want to ask about."}
          </small>
        </div>

        <button
          type="button"
          onClick={onClose}
          aria-label="Close selection"
        >
          x
        </button>
      </div>

      {mode === "orders" ? (
        <div className="wbo-support-order-picker">
          {orders.length ? (
            orders.slice(0, 12).map((order) => (
              <button
                type="button"
                key={order.order_id}
                onClick={() =>
                  onSelect({
                    type: "order",
                    value: order,
                  })
                }
              >
                <div className="wbo-support-order-picker-copy">
                  <strong>Order #{order.order_id}</strong>
                  <small>
                    {new Date(
                      order.order_date,
                    ).toLocaleString()}
                  </small>

                  {(order.items || []).slice(0, 2).map((item) => (
                    <span key={item.order_detail_id}>
                      {item.product_name} x{item.quantity}
                    </span>
                  ))}
                </div>

                <div className="wbo-support-order-picker-meta">
                  <StatusBadge status={order.status} />
                  <strong>
                    {money(order.total ?? order.total_amount)}
                  </strong>
                </div>
              </button>
            ))
          ) : (
            <div className="wbo-support-picker-empty">
              No orders are available yet.
            </div>
          )}
        </div>
      ) : (
        <div className="wbo-support-product-picker">
          {products.length ? (
            products.slice(0, 12).map((product) => (
              <button
                type="button"
                key={product.product_id}
                onClick={() =>
                  onSelect({
                    type: "product",
                    value: product,
                  })
                }
              >
                <div className="wbo-support-product-picker-image">
                  {product.image_url ? (
                    <img src={product.image_url} alt="" />
                  ) : (
                    <Icon name="products" size={26} />
                  )}
                </div>

                <strong>{product.name}</strong>
                <small>{money(product.unit_price)}</small>
                <span>
                  {Number(product.available_stock || 0)} in stock
                </span>
              </button>
            ))
          ) : (
            <div className="wbo-support-picker-empty">
              No products are available yet.
            </div>
          )}
        </div>
      )}
    </div>
  );
}