import React, { useMemo, useState } from "react";

/* WBO_ROLE_INVENTORY_ACTIONS_V2 */

const INITIAL_STOCK = {
  product_id: "",
  batch_number: "",
  quantity_received: "",
  expiry_date: "",
};

const INITIAL_PO_RECEIPT = {
  po_line: "",
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

export function PurchaseOrderReceivingForm({
  purchaseOrders = [],
  previewMode,
  busy,
  onSubmit,
}) {
  const [form, setForm] = useState(
    INITIAL_PO_RECEIPT,
  );
  const [error, setError] = useState("");

  const receivableLines = useMemo(
    () =>
      purchaseOrders.filter((po) => {
        const remaining =
          Number(po.quantity_ordered || 0) -
          Number(po.quantity_received || 0);

        return (
          ["ORDERED", "PARTIALLY_RECEIVED"].includes(
            po.status,
          ) && remaining > 0
        );
      }),
    [purchaseOrders],
  );

  const selectedLine = useMemo(() => {
    const [poId, detailId] =
      form.po_line.split(":");

    return receivableLines.find(
      (po) =>
        String(po.po_id) === poId &&
        String(po.po_detail_id) === detailId,
    );
  }, [form.po_line, receivableLines]);

  const remaining = selectedLine
    ? Number(selectedLine.quantity_ordered || 0) -
      Number(selectedLine.quantity_received || 0)
    : 0;

  const update = (field) => (event) => {
    setForm((current) => ({
      ...current,
      [field]: event.target.value,
    }));
  };

  const submit = async (event) => {
    event.preventDefault();

    if (
      previewMode ||
      busy ||
      !selectedLine
    ) {
      return;
    }

    setError("");

    try {
      await onSubmit(
        Number(selectedLine.po_id),
        {
          po_detail_id: Number(
            selectedLine.po_detail_id,
          ),
          batch_number:
            form.batch_number.trim(),
          quantity_received: Number(
            form.quantity_received,
          ),
          expiry_date:
            form.expiry_date || null,
        },
      );

      setForm(INITIAL_PO_RECEIPT);
    } catch (requestError) {
      setError(
        requestError.message ||
          "Unable to receive this purchase order.",
      );
    }
  };

  if (previewMode) {
    return (
      <div className="role-live-readonly">
        Purchase-order receiving is disabled in Super Admin preview mode.
      </div>
    );
  }

  if (!receivableLines.length) {
    return (
      <div className="role-live-readonly">
        No ordered purchase-order items are waiting to be received.
      </div>
    );
  }

  return (
    <form
      className="role-live-form"
      onSubmit={submit}
    >
      <div className="role-live-form-grid">
        <label className="role-live-form-wide">
          Purchase order item
          <select
            value={form.po_line}
            onChange={update("po_line")}
            required
          >
            <option value="">
              Select purchase order
            </option>
            {receivableLines.map((po) => {
              const lineRemaining =
                Number(po.quantity_ordered || 0) -
                Number(po.quantity_received || 0);

              return (
                <option
                  key={`${po.po_id}-${po.po_detail_id}`}
                  value={`${po.po_id}:${po.po_detail_id}`}
                >
                  {po.po_number} -{" "}
                  {po.product_name || "Product"} -{" "}
                  {lineRemaining} remaining
                </option>
              );
            })}
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
            max={remaining || undefined}
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

        <div>
          <p className="role-live-form-help">
            {selectedLine
              ? `${remaining} unit(s) remain on this purchase-order item.`
              : "Select an ordered purchase order to see the remaining quantity."}
          </p>
        </div>
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
        disabled={busy || !selectedLine}
      >
        {busy
          ? "Receiving..."
          : "Receive Purchase Order"}
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