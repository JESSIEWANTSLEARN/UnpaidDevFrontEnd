import React, { useMemo, useState } from "react";
import { backendUrl, loadCsrfToken } from "../../../config/api.js";
import { money } from "../../../utils/customer/customerStoreUtils.js";
import "../../../../css/customer/order-returns.css";

function statusLabel(status) {
  return String(status || "")
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function ReturnStatus({ request }) {
  return (
    <div className="customer-return-status-card">
      <div>
        <span>RETURN #{request.return_id}</span>
        <strong>{statusLabel(request.status)}</strong>
      </div>

      <p>{request.reason}</p>

      {request.inspection_disposition && (
        <small>
          Inspection: {statusLabel(request.inspection_disposition)}
        </small>
      )}

      {request.inspection_notes && (
        <small>{request.inspection_notes}</small>
      )}

      <div className="customer-return-refund">
        <span>Refund amount</span>
        <strong>{money(request.refund_amount || 0)}</strong>
      </div>

      {(request.items || []).length > 0 && (
        <div className="customer-return-items-summary">
          {request.items.map((item) => (
            <span key={item.return_item_id}>
              {item.quantity} × {item.product_name}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export default function CustomerOrderReturnPanel({
  order,
  previewMode = false,
}) {
  const [request, setRequest] = useState(
    order.return_request || null,
  );
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [selected, setSelected] = useState({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const paymentMethod = String(
    order.payment?.payment_method || "CASH_ON_DELIVERY",
  ).replaceAll("_", " ");

  const selectedItems = useMemo(
    () =>
      (order.items || [])
        .map((item) => ({
          order_detail_id: item.order_detail_id,
          quantity: Number(
            selected[item.order_detail_id] || 0,
          ),
        }))
        .filter((item) => item.quantity > 0),
    [order.items, selected],
  );

  const submit = async (event) => {
    event.preventDefault();

    if (
      previewMode ||
      busy ||
      !selectedItems.length
    ) {
      return;
    }

    try {
      setBusy(true);
      setError("");

      const token = await loadCsrfToken();
      const response = await fetch(
        backendUrl(
          `/api/user/orders/${order.order_id}/returns`,
        ),
        {
          method: "POST",
          credentials: "include",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            "X-CSRF-TOKEN": token,
          },
          body: JSON.stringify({
            reason: reason.trim(),
            items: selectedItems,
          }),
        },
      );

      const data = await response
        .json()
        .catch(() => ({}));

      if (!response.ok || data.success === false) {
        throw new Error(
          data.message ||
            "Return request could not be submitted.",
        );
      }

      setRequest(data.return_request || null);
      setOpen(false);
      setSelected({});
      setReason("");
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="customer-order-aftercare">
      {order.payment && (
        <div className="customer-order-payment-strip">
          <div>
            <span>PAYMENT</span>
            <strong>{paymentMethod}</strong>
          </div>

          <div>
            <span>STATUS</span>
            <strong>
              {statusLabel(order.payment.payment_status)}
            </strong>
          </div>

          {order.payment.reference_number && (
            <div>
              <span>REFERENCE</span>
              <strong>{order.payment.reference_number}</strong>
            </div>
          )}
        </div>
      )}

      {request ? (
        <ReturnStatus request={request} />
      ) : order.status === "FULFILLED" ? (
        <>
          {!open ? (
            <button
              type="button"
              className="customer-return-open"
              onClick={() => setOpen(true)}
              disabled={previewMode}
            >
              Request a return
            </button>
          ) : (
            <form
              className="customer-return-form"
              onSubmit={submit}
            >
              <div className="customer-return-form-head">
                <div>
                  <span>RETURN REQUEST</span>
                  <strong>Select returned items</strong>
                </div>

                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  disabled={busy}
                >
                  Cancel
                </button>
              </div>

              <div className="customer-return-item-picker">
                {(order.items || []).map((item) => (
                  <label key={item.order_detail_id}>
                    <input
                      type="checkbox"
                      checked={
                        Number(
                          selected[item.order_detail_id] || 0,
                        ) > 0
                      }
                      onChange={(event) =>
                        setSelected((current) => ({
                          ...current,
                          [item.order_detail_id]:
                            event.target.checked ? 1 : 0,
                        }))
                      }
                    />

                    <div>
                      <strong>{item.product_name}</strong>
                      <small>
                        Purchased: {item.quantity}
                      </small>
                    </div>

                    <input
                      type="number"
                      min="1"
                      max={item.quantity}
                      disabled={
                        !Number(
                          selected[item.order_detail_id] || 0,
                        )
                      }
                      value={
                        selected[item.order_detail_id] || 1
                      }
                      onChange={(event) =>
                        setSelected((current) => ({
                          ...current,
                          [item.order_detail_id]:
                            Math.max(
                              1,
                              Math.min(
                                item.quantity,
                                Number(event.target.value) || 1,
                              ),
                            ),
                        }))
                      }
                      aria-label={`Return quantity for ${item.product_name}`}
                    />
                  </label>
                ))}
              </div>

              <label className="customer-return-reason">
                <span>Reason for return</span>
                <textarea
                  required
                  minLength={3}
                  maxLength={500}
                  rows={3}
                  value={reason}
                  onChange={(event) =>
                    setReason(event.target.value)
                  }
                  placeholder="Example: damaged item, wrong item, defective unit..."
                />
              </label>

              {error && (
                <div className="customer-return-error">
                  {error}
                </div>
              )}

              <button
                type="submit"
                className="customer-return-submit"
                disabled={
                  busy ||
                  !reason.trim() ||
                  !selectedItems.length
                }
              >
                {busy
                  ? "Submitting..."
                  : "Submit return request"}
              </button>
            </form>
          )}
        </>
      ) : (
        <small className="customer-return-help">
          Returns become available after the order is fulfilled.
        </small>
      )}
    </div>
  );
}