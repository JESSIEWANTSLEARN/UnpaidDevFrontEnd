import React from "react";
import { Icon } from "../CustomerUi.jsx";
import CustomerCheckoutModal from "../checkout/CustomerCheckoutModal.jsx";
import CustomerCartDrawer from "../cart/CustomerCartDrawer.jsx";

export default function CustomerOverlays({ ctx }) {
  const {
    notice,
    cartFeedback,
    checkoutOpen,
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
    cartOpen,
    cartCount,
    setQty,
    startCheckout,
  } = ctx;

  return (
    <>
{notice && (
        <div className="customer-toast" role="status" aria-live="polite">
          <span><Icon name="check" size={17} /></span>
          <p>{notice}</p>
        </div>
      )}

      {cartFeedback && (
        <div
          key={cartFeedback.key}
          className={`customer-cart-feedback is-${cartFeedback.type}`}
          role="status"
          aria-live="polite"
        >
          <span>{cartFeedback.type === "success" ? <Icon name="check" size={17} /> : "!"}</span>
          <p>{cartFeedback.message}</p>
        </div>
      )}

      <CustomerCheckoutModal
        open={checkoutOpen}
        checkoutStep={checkoutStep}
        closeCheckout={closeCheckout}
        busy={busy}
        error={error}
        setError={setError}
        reviewCheckout={reviewCheckout}
        checkoutForm={checkoutForm}
        setCheckoutForm={setCheckoutForm}
        setCheckoutOpen={setCheckoutOpen}
        setCartOpen={setCartOpen}
        paymentMethod={paymentMethod}
        setPaymentMethod={setPaymentMethod}
        reviewPayment={reviewPayment}
        cartItems={cartItems}
        cartTotal={cartTotal}
        checkout={checkout}
        previewMode={previewMode}
        placedOrder={placedOrder}
        setTab={setTab}
        setNotice={setNotice}
      />
      <CustomerCartDrawer
        open={cartOpen}
        setCartOpen={setCartOpen}
        cartCount={cartCount}
        cartItems={cartItems}
        setQty={setQty}
        cartTotal={cartTotal}
        busy={busy}
        startCheckout={startCheckout}
        previewMode={previewMode}
      />
    </>
  );
}