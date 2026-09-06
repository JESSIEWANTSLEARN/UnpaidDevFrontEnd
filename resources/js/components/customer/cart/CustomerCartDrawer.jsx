import React from "react";
import { EmptyState, Icon } from "../CustomerUi.jsx";
import { money } from "../../../utils/customer/customerStoreUtils.js";

/** Shopping-cart drawer for the customer storefront. */
export default function CustomerCartDrawer({
  open,
  setCartOpen,
  cartCount,
  cartItems,
  setQty,
  cartTotal,
  busy,
  startCheckout,
  previewMode,
}) {
  if (!open) return null;

  return (
        <div className="customer-cart-layer">
          <button
            type="button"
            className="customer-cart-backdrop"
            onClick={() => setCartOpen(false)}
            aria-label="Close cart"
          />

          <aside className="customer-cart-drawer" aria-label="Shopping cart">
            <div className="customer-cart-head">
              <div>
                <span>YOUR CART</span>
                <h2>{cartCount} item{cartCount === 1 ? "" : "s"}</h2>
              </div>

              <button
                type="button"
                className="customer-icon-button"
                onClick={() => setCartOpen(false)}
                aria-label="Close cart"
              >
                <Icon name="close" />
              </button>
            </div>

            <div className="customer-cart-items">
              {cartItems.length ? (
                cartItems.map((item) => (
                  <article className="customer-cart-item" key={item.product_id}>
                    <div className="customer-cart-item-image">
                      {item.image_url ? (
                        <img src={item.image_url} alt={item.name} />
                      ) : (
                        <Icon name="products" size={26} />
                      )}
                    </div>

                    <div className="customer-cart-item-copy">
                      <strong>{item.name}</strong>
                      <span>{money(item.unit_price)}</span>
                      <small>{item.available_stock} available</small>

                      <div className="customer-qty">
                        <button
                          type="button"
                          onClick={() => setQty(item.product_id, item.quantity - 1)}
                          aria-label={`Decrease ${item.name} quantity`}
                        >
                          <Icon name="minus" size={15} />
                        </button>
                        <span>{item.quantity}</span>
                        <button
                          type="button"
                          className={
                            item.quantity >= item.available_stock
                              ? "is-at-limit"
                              : ""
                          }
                          onClick={() =>
                            setQty(item.product_id, item.quantity + 1)
                          }
                          aria-disabled={
                            item.quantity >= item.available_stock
                          }
                          aria-label={`Increase ${item.name} quantity`}
                        >
                          <Icon name="plus" size={15} />
                        </button>
                      </div>
                    </div>

                    <strong className="customer-cart-line-total">{money(item.line_total)}</strong>
                  </article>
                ))
              ) : (
                <EmptyState title="Your cart is empty" text="Add an available product to get started." />
              )}
            </div>

            <div className="customer-cart-footer">
              <div>
                <span>Subtotal</span>
                <strong>{money(cartTotal)}</strong>
              </div>
              <p>Final availability is rechecked when your order is submitted.</p>
              <button
                type="button"
                className="customer-primary customer-checkout-button"
                disabled={!cartItems.length || busy}
                onClick={startCheckout}
              >
                {previewMode
                  ? "Preview checkout"
                  : "Continue to checkout"}
                <Icon name="arrow" size={18} />
              </button>
            </div>
          </aside>
        </div>
  );
}
