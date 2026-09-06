import React from "react";
import { Icon } from "../CustomerUi.jsx";
import { money } from "../../../utils/customer/customerStoreUtils.js";

/** Checkout dialog kept separate from the customer page state/orchestration. */
export default function CustomerCheckoutModal({
  open,
  checkoutStep,
  closeCheckout,
  busy,
  error,
  setError,
  reviewCheckout,
  checkoutForm,
  setCheckoutForm,
  setCheckoutOpen,
  setCartOpen,
  paymentMethod,
  setPaymentMethod,
  reviewPayment,
  cartItems,
  cartTotal,
  checkout,
  previewMode,
  placedOrder,
  setTab,
  setNotice,
}) {
  if (!open) return null;

  return (
        <div className="customer-checkout-layer">
          <button
            type="button"
            className="customer-checkout-backdrop"
            onClick={closeCheckout}
            aria-label="Close checkout"
          />

          <section
            className="customer-checkout-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="customer-checkout-title"
          >
            <div className="customer-checkout-head">
              <div>
                <span>SECURE CHECKOUT</span>
                <h2 id="customer-checkout-title">
                  {checkoutStep === "details"
                    ? "Is this your delivery information?"
                    : checkoutStep === "payment"
                      ? "Choose your payment method"
                      : checkoutStep === "summary"
                        ? "Review and confirm"
                        : "Order placed successfully"}
                </h2>
                <p>
                  {checkoutStep === "details"
                    ? "Your saved account delivery information is filled in automatically. You can edit it for this order."
                    : checkoutStep === "payment"
                      ? "Select how you want to pay for this order."
                      : checkoutStep === "summary"
                        ? "Confirm the delivery information, payment method, products, and total."
                        : "Your order has been recorded and is waiting for processing."}
                </p>
              </div>

              <button
                type="button"
                className="customer-icon-button"
                onClick={closeCheckout}
                disabled={busy}
                aria-label="Close checkout"
              >
                <Icon name="close" />
              </button>
            </div>

            {error && checkoutStep !== "success" && (
              <div className="customer-checkout-error" role="alert">
                <span>!</span>
                <p>{error}</p>
                <button
                  type="button"
                  onClick={() => setError("")}
                  aria-label="Dismiss checkout error"
                >
                  <Icon name="close" size={15} />
                </button>
              </div>
            )}

            {checkoutStep !== "success" && (
              <div className="customer-checkout-steps" aria-label="Checkout progress">
                <span className={checkoutStep === "details" ? "is-active" : "is-done"}>
                  <strong>1</strong>
                  Delivery
                </span>
                <span
                  className={
                    checkoutStep === "payment"
                      ? "is-active"
                      : checkoutStep === "summary"
                        ? "is-done"
                        : ""
                  }
                >
                  <strong>2</strong>
                  Payment
                </span>
                <span className={checkoutStep === "summary" ? "is-active" : ""}>
                  <strong>3</strong>
                  Review
                </span>
              </div>
            )}

            {checkoutStep === "details" && (
              <form className="customer-checkout-form" onSubmit={reviewCheckout}>
                <div className="customer-checkout-grid">
                  <label>
                    <span>Full name</span>
                    <input
                      required
                      maxLength={100}
                      value={checkoutForm.full_name}
                      onChange={(event) =>
                        setCheckoutForm({ ...checkoutForm, full_name: event.target.value })
                      }
                    />
                  </label>

                  <label>
                    <span>Email address</span>
                    <input readOnly value={checkoutForm.email} className="is-readonly" />
                    <small>Uses your verified account email.</small>
                  </label>

                  <label>
                    <span>Contact number</span>
                    <input
                      required
                      maxLength={20}
                      value={checkoutForm.contact_number}
                      onChange={(event) =>
                        setCheckoutForm({ ...checkoutForm, contact_number: event.target.value })
                      }
                      placeholder="09XXXXXXXXX"
                    />
                  </label>

                  <label className="customer-checkout-wide">
                    <span>Street address</span>
                    <input
                      required
                      maxLength={255}
                      value={checkoutForm.street_address}
                      onChange={(event) =>
                        setCheckoutForm({ ...checkoutForm, street_address: event.target.value })
                      }
                      placeholder="House / unit number, street, subdivision"
                    />
                  </label>

                  <label>
                    <span>Barangay</span>
                    <input
                      required
                      maxLength={100}
                      value={checkoutForm.barangay}
                      onChange={(event) =>
                        setCheckoutForm({ ...checkoutForm, barangay: event.target.value })
                      }
                    />
                  </label>

                  <label>
                    <span>City / Municipality</span>
                    <input
                      required
                      maxLength={100}
                      value={checkoutForm.city_municipality}
                      onChange={(event) =>
                        setCheckoutForm({ ...checkoutForm, city_municipality: event.target.value })
                      }
                    />
                  </label>

                  <label>
                    <span>Province</span>
                    <input
                      required
                      maxLength={100}
                      value={checkoutForm.province}
                      onChange={(event) =>
                        setCheckoutForm({ ...checkoutForm, province: event.target.value })
                      }
                    />
                  </label>

                  <label>
                    <span>Postal code</span>
                    <input
                      required
                      maxLength={20}
                      value={checkoutForm.postal_code}
                      onChange={(event) =>
                        setCheckoutForm({ ...checkoutForm, postal_code: event.target.value })
                      }
                    />
                  </label>

                  <label className="customer-checkout-wide">
                    <span>Delivery notes <small>(optional)</small></span>
                    <textarea
                      maxLength={500}
                      rows={3}
                      value={checkoutForm.delivery_notes}
                      onChange={(event) =>
                        setCheckoutForm({ ...checkoutForm, delivery_notes: event.target.value })
                      }
                      placeholder="Landmark, gate instructions, preferred receiving note..."
                    />
                  </label>
                </div>

                <div className="customer-checkout-answer">
                  <span>Is this the correct delivery information?</span>
                  <strong>Review the fields above, then continue.</strong>
                </div>

                <div className="customer-checkout-actions">
                  <button
                    type="button"
                    className="customer-secondary"
                    onClick={() => {
                      setCheckoutOpen(false);
                      setCartOpen(true);
                    }}
                  >
                    Back to cart
                  </button>

                  <button type="submit" className="customer-primary">
                    Yes, continue <Icon name="arrow" size={18} />
                  </button>
                </div>
              </form>
            )}

            {checkoutStep === "payment" && (
              <div className="customer-checkout-review">
                <div className="customer-payment-options">
                  <button
                    type="button"
                    className={`customer-payment-option ${
                      paymentMethod === "CASH_ON_DELIVERY" ? "is-selected" : ""
                    }`}
                    onClick={() => setPaymentMethod("CASH_ON_DELIVERY")}
                  >
                    <span className="customer-payment-radio" />
                    <div>
                      <strong>Cash on Delivery</strong>
                      <small>Pay when your order is delivered.</small>
                    </div>
                    <span className="customer-payment-available">AVAILABLE</span>
                  </button>

                  <button type="button" className="customer-payment-option" disabled>
                    <span className="customer-payment-radio" />
                    <div>
                      <strong>GCash</strong>
                      <small>Online payment integration will be added later.</small>
                    </div>
                    <span>COMING SOON</span>
                  </button>

                  <button type="button" className="customer-payment-option" disabled>
                    <span className="customer-payment-radio" />
                    <div>
                      <strong>Bank Transfer</strong>
                      <small>Payment verification will be added later.</small>
                    </div>
                    <span>COMING SOON</span>
                  </button>
                </div>

                <div className="customer-checkout-actions">
                  <button type="button" className="customer-secondary" onClick={() => setCheckoutStep("details")}>
                    Back
                  </button>
                  <button type="button" className="customer-primary" onClick={reviewPayment}>
                    Review order <Icon name="arrow" size={18} />
                  </button>
                </div>
              </div>
            )}

            {checkoutStep === "summary" && (
              <div className="customer-checkout-review">
                <div className="customer-checkout-review-grid">
                  <section className="customer-checkout-review-card">
                    <span className="customer-kicker">DELIVERY</span>
                    <h3>{checkoutForm.full_name}</h3>
                    <p>{checkoutForm.email}</p>
                    <p>{checkoutForm.contact_number}</p>
                    <p className="customer-checkout-address">
                      {checkoutForm.street_address}, {checkoutForm.barangay},{" "}
                      {checkoutForm.city_municipality}, {checkoutForm.province}{" "}
                      {checkoutForm.postal_code}
                    </p>
                    {checkoutForm.delivery_notes && (
                      <small>Note: {checkoutForm.delivery_notes}</small>
                    )}
                    <button type="button" className="customer-text-link" onClick={() => setCheckoutStep("details")}>
                      Edit delivery details
                    </button>
                  </section>

                  <section className="customer-checkout-review-card">
                    <span className="customer-kicker">PAYMENT</span>
                    <h3>Cash on Delivery</h3>
                    <p>Payment status will remain pending until the order is completed.</p>
                    <button type="button" className="customer-text-link" onClick={() => setCheckoutStep("payment")}>
                      Change payment method
                    </button>
                  </section>

                  <section className="customer-checkout-review-card customer-checkout-order-summary-card">
                    <span className="customer-kicker">ORDER SUMMARY</span>
                    <div className="customer-checkout-items">
                      {cartItems.map((item) => (
                        <div key={item.product_id}>
                          <span>{item.quantity} {"\u00D7"} {item.name}</span>
                          <strong>{money(item.line_total)}</strong>
                        </div>
                      ))}
                    </div>
                    <div className="customer-checkout-total">
                      <span>Total</span>
                      <strong>{money(cartTotal)}</strong>
                    </div>
                  </section>
                </div>

                <div className="customer-checkout-confirm-note">
                  Final stock availability will be checked again when you confirm.
                </div>

                <div className="customer-checkout-actions">
                  <button type="button" className="customer-secondary" onClick={() => setCheckoutStep("payment")} disabled={busy}>
                    Back
                  </button>
                  <button type="button" className="customer-primary" onClick={checkout} disabled={busy}>
                    {previewMode ? "Preview confirmation" : busy ? "Placing order..." : "Confirm order"}
                    {!busy && <Icon name="check" size={18} />}
                  </button>
                </div>
              </div>
            )}

            {checkoutStep === "success" && (
              <div className="customer-checkout-success">
                <div className="customer-checkout-success-icon">
                  <Icon name="check" size={34} />
                </div>
                <span className="customer-kicker">
                  {previewMode ? "PREVIEW COMPLETE" : "ORDER CONFIRMED"}
                </span>
                <h3>
                  {previewMode
                    ? "Customer checkout preview completed"
                    : `Order #${placedOrder?.order_id} was placed successfully`}
                </h3>
                <p>
                  {previewMode
                    ? "No real order or payment was created while using Super Admin Customer View."
                    : "Your order is now pending and can be tracked from My Orders."}
                </p>

                <div className="customer-checkout-success-summary">
                  <div>
                    <span>Payment method</span>
                    <strong>Cash on Delivery</strong>
                  </div>
                  <div>
                    <span>Payment status</span>
                    <strong>{placedOrder?.payment_status ?? "PENDING"}</strong>
                  </div>
                  <div>
                    <span>Total</span>
                    <strong>{money(placedOrder?.total_amount ?? 0)}</strong>
                  </div>
                </div>

                <div className="customer-checkout-actions">
                  {!previewMode && (
                    <button
                      type="button"
                      className="customer-secondary"
                      onClick={() => {
                        closeCheckout();
                        setTab("shop");
                      }}
                    >
                      Continue shopping
                    </button>
                  )}
                  <button
                    type="button"
                    className="customer-primary"
                    onClick={() => {
                      closeCheckout();
                      if (previewMode) {
                        setNotice("Preview complete. No real order was created.");
                      } else {
                        setTab("orders");
                      }
                    }}
                  >
                    {previewMode ? "Close preview" : "View my orders"}
                  </button>
                </div>
              </div>
            )}
          </section>
        </div>
  );
}
