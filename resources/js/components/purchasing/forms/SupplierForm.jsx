import { useEffect, useState } from "react";

const EMPTY_SUPPLIER = {
  name: "",
  contact_number: "",
  email: "",
  address: "",
  lead_time_days: "7",
  supplier_status: "ACTIVE",
};

export default function SupplierForm({
  roleKey,
  previewMode,
  busy,
  selectedSupplier,
  onClearSelection,
  onCreate,
  onUpdate,
}) {
  const [form, setForm] = useState(EMPTY_SUPPLIER);
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
        selectedSupplier.supplier_status || "ACTIVE",
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
      lead_time_days: Number(form.lead_time_days),
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

  const manager = roleKey === "Purchasing_Manager";

  return (
    <form className="role-live-form" onSubmit={submit}>
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
            onChange={update("contact_number")}
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
            onChange={update("lead_time_days")}
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
              onChange={update("supplier_status")}
            >
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </label>
        )}
      </div>

      {error && (
        <p className="role-live-form-error" role="alert">
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
