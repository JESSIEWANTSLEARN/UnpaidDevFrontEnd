import { useMemo, useState } from "react";

const EMPTY_PO = {
  supplier_id: "",
  product_id: "",
  quantity: "",
  submit_for_approval: false,
};

export default function PurchaseOrderForm({
  suppliers,
  products,
  previewMode,
  busy,
  onCreate,
}) {
  const [form, setForm] = useState(EMPTY_PO);
  const [error, setError] = useState("");

  const activeSuppliers = useMemo(
    () =>
      suppliers.filter(
        (supplier) =>
          supplier.supplier_status === "ACTIVE",
      ),
    [suppliers],
  );

  const productOptions = useMemo(() => {
    if (!form.supplier_id) {
      return products;
    }

    const supplierId = Number(form.supplier_id);

    return products.filter(
      (product) =>
        product.supplier_id === null ||
        Number(product.supplier_id) === supplierId,
    );
  }, [form.supplier_id, products]);

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
        supplier_id: Number(form.supplier_id),
        product_id: Number(form.product_id),
        quantity: Number(form.quantity),
        submit_for_approval: Boolean(
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
    <form className="role-live-form" onSubmit={submit}>
      <div className="role-live-form-grid">
        <label>
          Supplier
          <select
            value={form.supplier_id}
            onChange={update("supplier_id")}
            required
          >
            <option value="">Select supplier</option>
            {activeSuppliers.map((supplier) => (
              <option
                key={supplier.supplier_id}
                value={supplier.supplier_id}
              >
                {supplier.name}
              </option>
            ))}
          </select>
        </label>

        <label>
          Product
          <select
            value={form.product_id}
            onChange={update("product_id")}
            required
          >
            <option value="">Select product</option>
            {productOptions.map((product) => (
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
            checked={form.submit_for_approval}
            onChange={update("submit_for_approval")}
          />
          Submit for manager approval
        </label>
      </div>

      {error && (
        <p className="role-live-form-error" role="alert">
          {error}
        </p>
      )}

      <button
        type="submit"
        className="role-live-primary"
        disabled={busy}
      >
        {busy ? "Creating..." : "Create Purchase Order"}
      </button>
    </form>
  );
}
