import React from "react";
import "../../../../css/customer/payment-demo.css";

const DEMO_BANK = {
  bank: "Walang Brownout Demo Bank",
  accountName: "Walang Brownout Home Comfort Store",
  accountNumber: "0000-0000-0000",
};

function demoReference(prefix) {
  const tail = String(Date.now()).slice(-8);
  return `${prefix}-DEMO-${tail}`;
}

export function paymentLabel(method) {
  if (method === "GCASH") return "GCash Demo QR";
  if (method === "BANK_TRANSFER") return "Mock Bank Transfer";
  return "Cash on Delivery";
}

export default function CustomerPaymentOptions({
  paymentMethod,
  setPaymentMethod,
  paymentReference,
  setPaymentReference,
}) {
  const choose = (method) => {
    setPaymentMethod(method);

    if (method === "CASH_ON_DELIVERY") {
      setPaymentReference("");
    }
  };

  return (
    <>
      <div className="customer-payment-options">
        <button
          type="button"
          className={`customer-payment-option ${
            paymentMethod === "CASH_ON_DELIVERY"
              ? "is-selected"
              : ""
          }`}
          onClick={() => choose("CASH_ON_DELIVERY")}
        >
          <span className="customer-payment-radio" />
          <div>
            <strong>Cash on Delivery</strong>
            <small>Pay when your order is delivered.</small>
          </div>
          <span className="customer-payment-available">AVAILABLE</span>
        </button>

        <button
          type="button"
          className={`customer-payment-option ${
            paymentMethod === "GCASH"
              ? "is-selected"
              : ""
          }`}
          onClick={() => choose("GCASH")}
        >
          <span className="customer-payment-radio" />
          <div>
            <strong>GCash</strong>
            <small>Demo QR payment for the finals presentation.</small>
          </div>
          <span className="customer-payment-demo-badge">DEMO</span>
        </button>

        <button
          type="button"
          className={`customer-payment-option ${
            paymentMethod === "BANK_TRANSFER"
              ? "is-selected"
              : ""
          }`}
          onClick={() => choose("BANK_TRANSFER")}
        >
          <span className="customer-payment-radio" />
          <div>
            <strong>Bank Transfer</strong>
            <small>Mock transfer with staff verification.</small>
          </div>
          <span className="customer-payment-demo-badge">DEMO</span>
        </button>
      </div>

      {paymentMethod === "GCASH" && (
        <section className="customer-demo-payment">
          <div className="customer-demo-payment-head">
            <div>
              <span>GCASH DEMO</span>
              <strong>Scan the mock QR</strong>
            </div>
            <em>No real payment is processed.</em>
          </div>

          <div className="customer-demo-gcash-grid">
            <div className="customer-demo-qr" aria-label="Demo QR code">
              <span>DEMO</span>
            </div>

            <div className="customer-demo-payment-copy">
              <p>
                This QR is a presentation mockup only. Generate a demo
                reference to simulate a submitted GCash payment.
              </p>

              <label>
                <span>Demo reference number</span>
                <input
                  value={paymentReference}
                  maxLength={100}
                  onChange={(event) =>
                    setPaymentReference(event.target.value)
                  }
                  placeholder="GCASH-DEMO-12345678"
                />
              </label>

              <button
                type="button"
                onClick={() =>
                  setPaymentReference(
                    demoReference("GCASH"),
                  )
                }
              >
                Generate demo reference
              </button>
            </div>
          </div>
        </section>
      )}

      {paymentMethod === "BANK_TRANSFER" && (
        <section className="customer-demo-payment">
          <div className="customer-demo-payment-head">
            <div>
              <span>BANK TRANSFER DEMO</span>
              <strong>Mock transfer instructions</strong>
            </div>
            <em>No real money is transferred.</em>
          </div>

          <div className="customer-demo-bank-details">
            <div>
              <span>Bank</span>
              <strong>{DEMO_BANK.bank}</strong>
            </div>
            <div>
              <span>Account name</span>
              <strong>{DEMO_BANK.accountName}</strong>
            </div>
            <div>
              <span>Account number</span>
              <strong>{DEMO_BANK.accountNumber}</strong>
            </div>
          </div>

          <div className="customer-demo-payment-copy">
            <label>
              <span>Mock transaction reference</span>
              <input
                value={paymentReference}
                maxLength={100}
                onChange={(event) =>
                  setPaymentReference(event.target.value)
                }
                placeholder="BANK-DEMO-12345678"
              />
            </label>

            <button
              type="button"
              onClick={() =>
                setPaymentReference(
                  demoReference("BANK"),
                )
              }
            >
              Generate demo reference
            </button>
          </div>
        </section>
      )}
    </>
  );
}