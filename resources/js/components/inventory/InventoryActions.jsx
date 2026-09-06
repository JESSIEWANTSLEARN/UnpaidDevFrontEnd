import React, { useMemo, useState } from "react";

/* WBO_ROLE_INVENTORY_ACTIONS_V1 */

const INITIAL_STOCK = {
  product_id: "",
  batch_number: "",
  quantity_received: "",
  expiry_date: "",
};

const INITIAL_ADJUSTMENT = {
  batch_id: "",
  quantity_change: "",
  reference_note: "",
};

export function StockInForm({
  products,
  previewMode,
  busy,
  onSubmit,
}) {
  const [form, setForm] = useState(INITIAL_STOCK);
  const [error, setError] = useState("");

  const update = (field) => (event) => {
    setForm((current) => ({
      ...current,
      [field]: event.target.value,
    }));
  };

  const submit = async (event) => {
    event.preventDefault();

    if (previewMode || busy) {
      return;
    }

    setError("");

    try {
      await onSubmit({
        product_id: Number(form.product_id),
        batch_number: form.batch_number.trim(),
        quantity_received: Number(
          form.quantity_received,
        ),
        expiry_date: form.expiry_date || null,
      });

      setForm(INITIAL_STOCK);
    } catch (requestError) {
      setError(
        requestError.message ||
          "Unable to receive stock.",
      );
    }
  };

  if (previewMode) {
    return (
      <div className="role-live-readonly">
        Stock In is disabled in Super Admin preview mode.
      </div>
    );
  }

  return (
    <form
      className="role-live-form"
      onSubmit={submit}
    >
      <div className="role-live-form-grid">
        <label>
          Product
          <select
            value={form.product_id}
            onChange={update("product_id")}
            required
          >
            <option value="">Select product</option>
            {products.map((product) => (
              <option
                key={product.product_id}
                value={product.product_id}
              >
                {product.sku} - {product.name}
              </option>
            ))}
          </select>
        </label>

        <label>
          Batch number
          <input
            value={form.batch_number}
            onChange={update("batch_number")}
            maxLength={50}
            required
          />
        </label>

        <label>
          Quantity received
          <input
            type="number"
            min="1"
            value={form.quantity_received}
            onChange={update("quantity_received")}
            required
          />
        </label>

        <label>
          Expiry date
          <input
            type="date"
            value={form.expiry_date}
            onChange={update("expiry_date")}
          />
        </label>
      </div>

      {error && (
        <p
          className="role-live-form-error"
          role="alert"
        >
          {error}
        </p>
      )}

      <button
        type="submit"
        className="role-live-primary"
        disabled={busy}
      >
        {busy ? "Saving..." : "Receive Stock"}
      </button>
    </form>
  );
}

export function AdjustmentForm({
  batches,
  previewMode,
  busy,
  onSubmit,
}) {
  const [form, setForm] =
    useState(INITIAL_ADJUSTMENT);
  const [error, setError] = useState("");

  const availableBatches = useMemo(
    () =>
      batches.filter(
        (batch) => batch.current_quantity >= 0,
      ),
    [batches],
  );

  const update = (field) => (event) => {
    setForm((current) => ({
      ...current,
      [field]: event.target.value,
    }));
  };

  const submit = async (event) => {
    event.preventDefault();

    if (previewMode || busy) {
      return;
    }

    setError("");

    try {
      await onSubmit({
        batch_id: Number(form.batch_id),
        quantity_change: Number(
          form.quantity_change,
        ),
        reference_note:
          form.reference_note.trim(),
      });

      setForm(INITIAL_ADJUSTMENT);
    } catch (requestError) {
      setError(
        requestError.message ||
          "Unable to save the adjustment.",
      );
    }
  };

  if (previewMode) {
    return (
      <div className="role-live-readonly">
        Inventory adjustments are disabled in
        Super Admin preview mode.
      </div>
    );
  }

  return (
    <form
      className="role-live-form"
      onSubmit={submit}
    >
      <div className="role-live-form-grid">
        <label>
          Batch
          <select
            value={form.batch_id}
            onChange={update("batch_id")}
            required
          >
            <option value="">Select batch</option>
            {availableBatches.map((batch) => (
              <option
                key={batch.batch_id}
                value={batch.batch_id}
              >
                {batch.batch_number} -{" "}
                {batch.product_name} (
                {batch.current_quantity} available)
              </option>
            ))}
          </select>
        </label>

        <label>
          Quantity change
          <input
            type="number"
            value={form.quantity_change}
            onChange={update("quantity_change")}
            placeholder="Example: -2 or 5"
            required
          />
        </label>

        <label className="role-live-form-wide">
          Reason / reference note
          <input
            value={form.reference_note}
            onChange={update("reference_note")}
            maxLength={255}
            placeholder="Explain why stock is being adjusted"
            required
          />
        </label>
      </div>

      <p className="role-live-form-help">
        Use a positive number to add stock or a
        negative number to reduce stock. Stock can
        never become negative.
      </p>

      {error && (
        <p
          className="role-live-form-error"
          role="alert"
        >
          {error}
        </p>
      )}

      <button
        type="submit"
        className="role-live-primary"
        disabled={busy}
      >
        {busy ? "Saving..." : "Save Adjustment"}
      </button>
    </form>
  );
}