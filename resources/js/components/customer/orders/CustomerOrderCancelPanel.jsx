import React, { useState } from "react";
import { Icon } from "../CustomerUi.jsx";

const REASONS = [
  "Changed my mind",
  "Ordered by mistake",
  "Need to change quantity",
  "Need to change delivery details",
  "Payment issue",
  "Other",
];

const formatPeso = (value) =>
  new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 2,
  }).format(Number(value || 0));

export default function CustomerOrderCancelPanel({
  order,
  previewMode,
  busy,
  onCancel,
  onContactSupport,
}) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState(REASONS[0]);
  const [otherReason, setOtherReason] = useState("");

  const status = String(
    order?.status || "",
  ).toUpperCase();

  const paymentStatus = String(
    order?.payment?.payment_status || "",
  ).toUpperCase();

  const paymentMethod = String(
    order?.payment?.payment_method || "",
  ).toUpperCase();

  const isPaidWallet =
    paymentMethod === "WALLET" &&
    paymentStatus === "PAID";

  const canCancel =
    !previewMode &&
    status === "PENDING" &&
    (
      paymentStatus !== "PAID" ||
      isPaidWallet
    );

  const requiresSupport =
    !previewMode &&
    (
      status === "PROCESSING" ||
      status === "CONFIRMED" ||
      (
        status === "PENDING" &&
        paymentStatus === "PAID" &&
        !isPaidWallet
      )
    );

  if (
    status === "FULFILLED" ||
    status === "CANCELLED" ||
    status === "UNFULFILLED"
  ) {
    return null;
  }

  const submit = async () => {
    const finalReason =
      reason === "Other"
        ? otherReason.trim()
        : reason;

    if (!finalReason) return;

    const success = await onCancel(
      order.order_id,
      finalReason,
    );

    if (success) {
      setOpen(false);
      setReason(REASONS[0]);
      setOtherReason("");
    }
  };

  return (
    <>
      <div className="customer-order-control">
        <div>
          <span>ORDER CONTROL</span>

          {canCancel ? (
            <p>
              {isPaidWallet
                ? `This pending Wallet order can be cancelled now. ${formatPeso(
                    order?.payment?.amount,
                  )} will be returned automatically to your wallet.`
                : "This order is still pending and can be cancelled before processing begins."}
            </p>
          ) : (
            <p>
              This order can no longer be cancelled
              directly. Contact Sales Support for help.
            </p>
          )}
        </div>

        <div className="customer-order-control-actions">
          {canCancel ? (
            <button
              type="button"
              className="customer-order-cancel-button"
              onClick={() => setOpen(true)}
              disabled={busy}
            >
              <Icon name="close" size={16} />
              {isPaidWallet
                ? "Cancel & refund"
                : "Cancel order"}
            </button>
          ) : null}

          {requiresSupport ? (
            <button
              type="button"
              className="customer-order-support-button"
              onClick={() => onContactSupport(order)}
            >
              <Icon name="chat" size={16} />
              Contact support
            </button>
          ) : null}
        </div>
      </div>

      {open ? (
        <div
          className="customer-cancel-layer"
          role="dialog"
          aria-modal="true"
          aria-labelledby="cancel-order-title"
        >
          <button
            type="button"
            className="customer-cancel-backdrop"
            onClick={() => !busy && setOpen(false)}
            aria-label="Close cancel order dialog"
          />

          <div className="customer-cancel-modal">
            <div className="customer-cancel-head">
              <div>
                <span>
                  {isPaidWallet
                    ? "CANCEL & REFUND"
                    : "CANCEL ORDER"}
                </span>
                <h2 id="cancel-order-title">
                  Order #{order.order_id}
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setOpen(false)}
                disabled={busy}
                aria-label="Close"
              >
                <Icon name="close" size={18} />
              </button>
            </div>

            <div className="customer-cancel-body">
              <p>
                {isPaidWallet
                  ? `${formatPeso(
                      order?.payment?.amount,
                    )} will be returned to your Walang Brownout Wallet when this cancellation succeeds.`
                  : "Choose why you want to cancel this order. The cancellation cannot be undone."}
              </p>

              <label>
                <span>Reason</span>
                <select
                  value={reason}
                  onChange={(event) =>
                    setReason(event.target.value)
                  }
                  disabled={busy}
                >
                  {REASONS.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </label>

              {reason === "Other" ? (
                <label>
                  <span>Explain briefly</span>
                  <textarea
                    value={otherReason}
                    onChange={(event) =>
                      setOtherReason(event.target.value)
                    }
                    maxLength={255}
                    rows={3}
                    placeholder="Enter cancellation reason..."
                    disabled={busy}
                  />
                </label>
              ) : null}
            </div>

            <div className="customer-cancel-footer">
              <button
                type="button"
                className="customer-cancel-keep"
                onClick={() => setOpen(false)}
                disabled={busy}
              >
                Keep order
              </button>

              <button
                type="button"
                className="customer-cancel-confirm"
                onClick={submit}
                disabled={
                  busy ||
                  (
                    reason === "Other" &&
                    !otherReason.trim()
                  )
                }
              >
                {busy
                  ? isPaidWallet
                    ? "Refunding..."
                    : "Cancelling..."
                  : isPaidWallet
                    ? "Confirm cancel & refund"
                    : "Confirm cancellation"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
