import React, { useMemo, useState } from "react";
import { Icon } from "../CustomerUi.jsx";

const QUICK_AMOUNTS = ["500", "1000", "2500", "5000"];

const formatPeso = (value) =>
  new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 2,
  }).format(Number(value || 0));

const transactionSign = (type) =>
  ["TOP_UP", "REFUND", "REVERSAL", "ADJUSTMENT"].includes(
    String(type || "").toUpperCase(),
  )
    ? "+"
    : "-";

export default function CustomerWalletPanel({
  walletData,
  busy,
  previewMode,
  onTopUp,
}) {
  const [amount, setAmount] = useState("1000");
  const [paymentMethod, setPaymentMethod] = useState("GCASH");
  const [referenceNumber, setReferenceNumber] = useState("");
  const [localError, setLocalError] = useState("");

  const wallet = walletData?.wallet ?? {
    balance: "0.00",
    status: "ACTIVE",
  };

  const transactions = Array.isArray(walletData?.transactions)
    ? walletData.transactions
    : [];

  const completedTopUps = useMemo(
    () =>
      transactions.filter(
        (item) =>
          item.type === "TOP_UP" &&
          item.status === "COMPLETED",
      ),
    [transactions],
  );

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLocalError("");

    const numericAmount = Number(amount);

    if (!Number.isFinite(numericAmount) || numericAmount < 10) {
      setLocalError("Minimum top-up is PHP 10.00.");
      return;
    }

    if (!referenceNumber.trim()) {
      setLocalError("Enter your demo payment reference.");
      return;
    }

    const success = await onTopUp({
      amount: numericAmount.toFixed(2),
      payment_method: paymentMethod,
      reference_number: referenceNumber.trim(),
    });

    if (success) {
      setReferenceNumber("");
    }
  };

  return (
    <section className="customer-page-section customer-wallet-page">
      <div className="customer-page-title">
        <div>
          <span className="customer-kicker">WALANG BROWNOUT WALLET</span>
          <h1>My wallet</h1>
          <p>
            Add demo funds instantly, review every wallet movement,
            and prepare for wallet checkout in the next stage.
          </p>
        </div>

        <span
          className={`customer-wallet-status is-${String(
            wallet.status || "ACTIVE",
          ).toLowerCase()}`}
        >
          {wallet.status || "ACTIVE"}
        </span>
      </div>

      <div className="customer-wallet-grid">
        <article className="customer-wallet-balance-card">
          <div className="customer-wallet-balance-top">
            <span>AVAILABLE BALANCE</span>
            <Icon name="wallet" size={26} />
          </div>

          <strong>{formatPeso(wallet.balance)}</strong>

          <p>
            Balance changes only through the Laravel wallet API.
            React never edits this value directly.
          </p>

          <div className="customer-wallet-balance-meta">
            <div>
              <span>Completed top-ups</span>
              <strong>{completedTopUps.length}</strong>
            </div>

            <div>
              <span>Transactions</span>
              <strong>{transactions.length}</strong>
            </div>
          </div>
        </article>

        <article className="customer-wallet-topup-card">
          <div className="customer-wallet-card-head">
            <div>
              <span>INSTANT TOP UP</span>
              <h2>Add wallet funds</h2>
            </div>
            <Icon name="plus" size={22} />
          </div>

          {previewMode ? (
            <div className="customer-wallet-preview-note">
              Wallet-changing actions are disabled in Super Admin preview.
            </div>
          ) : (
            <form
              className="customer-wallet-topup-form"
              onSubmit={handleSubmit}
            >
              <label>
                <span>Amount</span>
                <div className="customer-wallet-amount-input">
                  <strong>PHP</strong>
                  <input
                    type="number"
                    min="10"
                    max="100000"
                    step="0.01"
                    value={amount}
                    onChange={(event) =>
                      setAmount(event.target.value)
                    }
                    disabled={busy}
                    required
                  />
                </div>
              </label>

              <div className="customer-wallet-quick-amounts">
                {QUICK_AMOUNTS.map((item) => (
                  <button
                    type="button"
                    key={item}
                    className={amount === item ? "is-active" : ""}
                    onClick={() => setAmount(item)}
                    disabled={busy}
                  >
                    {formatPeso(item)}
                  </button>
                ))}
              </div>

              <fieldset>
                <legend>Payment method</legend>

                <label
                  className={
                    paymentMethod === "GCASH"
                      ? "is-selected"
                      : ""
                  }
                >
                  <input
                    type="radio"
                    name="wallet-payment-method"
                    value="GCASH"
                    checked={paymentMethod === "GCASH"}
                    onChange={() => setPaymentMethod("GCASH")}
                    disabled={busy}
                  />
                  <span>
                    <strong>GCash</strong>
                    <small>Demo instant top-up</small>
                  </span>
                </label>

                <label
                  className={
                    paymentMethod === "BANK_TRANSFER"
                      ? "is-selected"
                      : ""
                  }
                >
                  <input
                    type="radio"
                    name="wallet-payment-method"
                    value="BANK_TRANSFER"
                    checked={paymentMethod === "BANK_TRANSFER"}
                    onChange={() =>
                      setPaymentMethod("BANK_TRANSFER")
                    }
                    disabled={busy}
                  />
                  <span>
                    <strong>Bank / ATM</strong>
                    <small>Demo instant top-up</small>
                  </span>
                </label>
              </fieldset>

              <label>
                <span>Payment reference</span>
                <input
                  type="text"
                  value={referenceNumber}
                  onChange={(event) =>
                    setReferenceNumber(event.target.value)
                  }
                  maxLength={100}
                  placeholder={
                    paymentMethod === "GCASH"
                      ? "Example: GCASH-DEMO-001"
                      : "Example: BANK-DEMO-001"
                  }
                  disabled={busy}
                  required
                />
                <small>
                  Each reference can only be used once for this account.
                </small>
              </label>

              {localError ? (
                <div
                  className="customer-wallet-form-error"
                  role="alert"
                >
                  {localError}
                </div>
              ) : null}

              <button
                type="submit"
                className="customer-wallet-topup-submit"
                disabled={busy}
              >
                <Icon name="plus" size={18} />
                {busy ? "Adding funds..." : "Top up wallet"}
              </button>
            </form>
          )}
        </article>
      </div>

      <article className="customer-wallet-history">
        <div className="customer-wallet-card-head">
          <div>
            <span>TRANSACTION HISTORY</span>
            <h2>Recent wallet activity</h2>
          </div>
          <small>Latest 50 records</small>
        </div>

        {transactions.length ? (
          <div className="customer-wallet-transactions">
            {transactions.map((item) => {
              const sign = transactionSign(item.type);
              const incoming = sign === "+";

              return (
                <div
                  className="customer-wallet-transaction"
                  key={item.wallet_transaction_id}
                >
                  <div
                    className={`customer-wallet-transaction-icon ${
                      incoming ? "is-credit" : "is-debit"
                    }`}
                  >
                    <Icon
                      name={incoming ? "plus" : "minus"}
                      size={16}
                    />
                  </div>

                  <div className="customer-wallet-transaction-copy">
                    <strong>
                      {String(item.type || "")
                        .replaceAll("_", " ")}
                    </strong>
                    <span>
                      {item.description ||
                        "Wallet transaction"}
                    </span>
                    <small>
                      {new Date(
                        item.created_at,
                      ).toLocaleString()}
                    </small>
                  </div>

                  <div className="customer-wallet-transaction-reference">
                    <span>
                      {item.payment_method
                        ? String(item.payment_method).replaceAll(
                            "_",
                            " ",
                          )
                        : item.order_id
                          ? `Order #${item.order_id}`
                          : "Wallet"}
                    </span>
                    {item.reference_number ? (
                      <small>{item.reference_number}</small>
                    ) : null}
                  </div>

                  <div
                    className={`customer-wallet-transaction-amount ${
                      incoming ? "is-credit" : "is-debit"
                    }`}
                  >
                    <strong>
                      {sign}
                      {formatPeso(item.amount)}
                    </strong>
                    <small>
                      Balance {formatPeso(item.balance_after)}
                    </small>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="customer-wallet-empty">
            <Icon name="wallet" size={30} />
            <strong>No wallet activity yet</strong>
            <span>
              Your first completed top-up will appear here.
            </span>
          </div>
        )}
      </article>
    </section>
  );
}
