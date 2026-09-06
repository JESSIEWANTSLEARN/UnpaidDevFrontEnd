import React from "react";
import { ErrorMessage, SubmitButton, submit } from "./FormHelpers.jsx";

export default function AccountSettingsModal({
  busy,
  error,
  profileForm,
  setProfileForm,
  onProfileSave,
}) {
  const update = (field) => (event) =>
    setProfileForm((form) => ({ ...form, [field]: event.target.value }));

  return (
    <form className="admin-modal-body" onSubmit={(event) => submit(event, busy, onProfileSave)}>
      <div className="admin-form-row">
        <label>Display Name</label>
        <input type="text" value={profileForm.name} maxLength={100} required onChange={update("name")} />
      </div>
      <div className="admin-form-row">
        <label>Email</label>
        <input type="email" value={profileForm.email} maxLength={100} required onChange={update("email")} />
      </div>
      <div className="admin-form-row">
        <label>Contact Number</label>
        <input type="text" value={profileForm.contact_number} maxLength={20} onChange={update("contact_number")} />
      </div>
      <ErrorMessage error={error} />
      <SubmitButton busy={busy} busyText="Saving...">Save Changes</SubmitButton>
    </form>
  );
}
