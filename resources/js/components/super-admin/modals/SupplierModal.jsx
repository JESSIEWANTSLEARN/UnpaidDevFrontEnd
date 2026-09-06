import React from "react";
import { ErrorMessage, SubmitButton, submit } from "./FormHelpers.jsx";

export default function SupplierModal({ busy, error, supplierForm, setSupplierForm, onAddSupplier }) {
  const update = (field) => (event) => setSupplierForm((form) => ({ ...form, [field]: event.target.value }));

  return (
    <form className="admin-modal-body" onSubmit={(event) => submit(event, busy, onAddSupplier)}>
      <div className="admin-form-row"><label>Supplier Name</label><input value={supplierForm.name} maxLength={150} required onChange={update("name")} /></div>
      <div className="admin-form-row"><label>Contact Number</label><input value={supplierForm.contact_number} maxLength={20} onChange={update("contact_number")} /></div>
      <div className="admin-form-row"><label>Email</label><input type="email" value={supplierForm.email} maxLength={100} onChange={update("email")} /></div>
      <div className="admin-form-row"><label>Lead Time (days)</label><input type="number" min="0" value={supplierForm.lead_time_days} required onChange={update("lead_time_days")} /></div>
      <ErrorMessage error={error} />
      <SubmitButton busy={busy} busyText="Adding...">+ Add Supplier</SubmitButton>
    </form>
  );
}
