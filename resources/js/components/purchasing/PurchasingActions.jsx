import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

/* WBO_ROLE_PURCHASING_ACTIONS_V1 */

const EMPTY_SUPPLIER = {
  name: "",
  contact_number: "",
  email: "",
  address: "",
  lead_time_days: "7",
  supplier_status: "ACTIVE",
};

const EMPTY_PO = {
  supplier_id: "",
  product_id: "",
  quantity: "",
  submit_for_approval: false,
};

export function SupplierForm({
  roleKey,
  previewMode,
  busy,
  selectedSupplier,
  onClearSelection,
  onCreate,
  onUpdate,
}) {
  const [form, setForm] =
    useState(EMPTY_SUPPLIER);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!selectedSupplier) {
      setForm(EMPTY_SUPPLIER);
      return;
    }

    setForm({
      name: selectedSupplier.name || "",
      contact_number:
        selectedSupplier.contact_number || "",
      email: selectedSupplier.email || "",
      address: selectedSupplier.address || "",
      lead_time_days: String(
        selectedSupplier.lead_time_days ?? 7,
      ),
      supplier_status:
        selectedSupplier.supplier_status ||
        "ACTIVE",
    });
  }, [selectedSupplier]);

  const update = (field) => (event) => {
    setForm((current) => ({
      ...current,
      [field]: event.target.value,
    }));
  };

  const submit = async (event) => {
    event.preventDefault();

    if (previewMode || busy) return;

    setError("");

    const payload = {
      ...form,
      name: form.name.trim(),
      contact_number:
        form.contact_number.trim() || null,
      email: form.email.trim() || null,
      address: form.address.trim() || null,
      lead_time_days: Number(
        form.lead_time_days,
      ),
    };

    try {
      if (selectedSupplier) {
        await onUpdate(
          selectedSupplier.supplier_id,
          payload,
        );
        onClearSelection();
      } else {
        await onCreate(payload);
      }

      setForm(EMPTY_SUPPLIER);
    } catch (requestError) {
      setError(
        requestError.message ||
          "Unable to save supplier.",
      );
    }
  };

  if (previewMode) {
    return (
      <div className="role-live-readonly">
        Supplier changes are disabled in Super
        Admin preview mode.
      </div>
    );
  }

  const manager =
    roleKey === "Purchasing_Manager";

  return (
    <form
      className="role-live-form"
      onSubmit={submit}
    >
      <div className="role-live-form-grid">
        <label>
          Supplier name
          <input
            value={form.name}
            onChange={update("name")}
            maxLength={150}
            required
          />
        </label>

        <label>
          Contact number
          <input
            value={form.contact_number}
            onChange={update(
              "contact_number",
            )}
            maxLength={20}
          />
        </label>

        <label>
          Email
          <input
            type="email"
            value={form.email}
            onChange={update("email")}
            maxLength={100}
          />
        </label>

        <label>
          Lead time (days)
          <input
            type="number"
            min="0"
            value={form.lead_time_days}
            onChange={update(
              "lead_time_days",
            )}
            required
          />
        </label>

        <label className="role-live-form-wide">
          Address
          <input
            value={form.address}
            onChange={update("address")}
            maxLength={255}
          />
        </label>

        {manager && (
          <label>
            Supplier status
            <select
              value={form.supplier_status}
              onChange={update(
                "supplier_status",
              )}
            >
              <option value="ACTIVE">
                Active
              </option>
              <option value="INACTIVE">
                Inactive
              </option>
            </select>
          </label>
        )}
      </div>

      {error && (
        <p
          className="role-live-form-error"
          role="alert"
        >
          {error}
        </p>
      )}

      <div className="role-live-form-actions">
        <button
          type="submit"
          className="role-live-primary"
          disabled={busy}
        >
          {busy
            ? "Saving..."
            : selectedSupplier
              ? "Update Supplier"
              : "Add Supplier"}
        </button>

        {selectedSupplier && (
          <button
            type="button"
            className="role-live-secondary"
            onClick={onClearSelection}
            disabled={busy}
          >
            Cancel Edit
          </button>
        )}
      </div>
    </form>
  );
}

export function PurchaseOrderForm({
  suppliers,
  products,
  previewMode,
  busy,
  onCreate,
}) {
  const [form, setForm] =
    useState(EMPTY_PO);
  const [error, setError] = useState("");

  const activeSuppliers = useMemo(
    () =>
      suppliers.filter(
        (supplier) =>
          supplier.supplier_status ===
          "ACTIVE",
      ),
    [suppliers],
  );

  const productOptions = useMemo(() => {
    if (!form.supplier_id) {
      return products;
    }

    const supplierId = Number(
      form.supplier_id,
    );

    return products.filter(
      (product) =>
        product.supplier_id === null ||
        Number(product.supplier_id) ===
          supplierId,
    );
  }, [
    form.supplier_id,
    products,
  ]);

  const update = (field) => (event) => {
    const value =
      event.target.type === "checkbox"
        ? event.target.checked
        : event.target.value;

    setForm((current) => ({
      ...current,
      [field]: value,
      ...(field === "supplier_id"
        ? { product_id: "" }
        : {}),
    }));
  };

  const submit = async (event) => {
    event.preventDefault();

    if (previewMode || busy) return;

    setError("");

    try {
      await onCreate({
        supplier_id: Number(
          form.supplier_id,
        ),
        product_id: Number(form.product_id),
        quantity: Number(form.quantity),
        submit_for_approval:
          Boolean(
            form.submit_for_approval,
          ),
      });

      setForm(EMPTY_PO);
    } catch (requestError) {
      setError(
        requestError.message ||
          "Unable to create purchase order.",
      );
    }
  };

  if (previewMode) {
    return (
      <div className="role-live-readonly">
        Purchase-order creation is disabled in
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
          Supplier
          <select
            value={form.supplier_id}
            onChange={update("supplier_id")}
            required
          >
            <option value="">
              Select supplier
            </option>
            {activeSuppliers.map(
              (supplier) => (
                <option
                  key={supplier.supplier_id}
                  value={
                    supplier.supplier_id
                  }
                >
                  {supplier.name}
                </option>
              ),
            )}
          </select>
        </label>

        <label>
          Product
          <select
            value={form.product_id}
            onChange={update("product_id")}
            required
          >
            <option value="">
              Select product
            </option>
            {productOptions.map(
              (product) => (
                <option
                  key={product.product_id}
                  value={
                    product.product_id
                  }
                >
                  {product.sku} -{" "}
                  {product.name}
                </option>
              ),
            )}
          </select>
        </label>

        <label>
          Quantity
          <input
            type="number"
            min="1"
            value={form.quantity}
            onChange={update("quantity")}
            required
          />
        </label>

        <label className="role-live-checkbox">
          <input
            type="checkbox"
            checked={
              form.submit_for_approval
            }
            onChange={update(
              "submit_for_approval",
            )}
          />
          Submit for manager approval
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
        {busy
          ? "Creating..."
          : "Create Purchase Order"}
      </button>
    </form>
  );
}