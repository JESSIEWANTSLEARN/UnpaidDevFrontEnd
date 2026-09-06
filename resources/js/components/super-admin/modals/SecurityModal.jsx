import React from "react";
import { ErrorMessage, SubmitButton, submit } from "./FormHelpers.jsx";

export default function SecurityModal({
  busy,
  error,
  passwordForm,
  setPasswordForm,
  onPasswordUpdate,
}) {
  const update = (field) => (event) =>
    setPasswordForm((form) => ({ ...form, [field]: event.target.value }));

  return (
    <form className="admin-modal-body" onSubmit={(event) => submit(event, busy, onPasswordUpdate)}>
      <p className="ops-subtext">Manage your password and account security settings.</p>
      <div className="admin-form-row">
        <label>Current Password</label>
        <input type="password" value={passwordForm.current_password} required onChange={update("current_password")} />
      </div>
      <div className="admin-form-row">
        <label>New Password</label>
        <input type="password" value={passwordForm.password} minLength={6} required onChange={update("password")} />
      </div>
      <div className="admin-form-row">
        <label>Confirm New Password</label>
        <input type="password" value={passwordForm.password_confirmation} minLength={6} required onChange={update("password_confirmation")} />
      </div>
      <ErrorMessage error={error} />
      <SubmitButton busy={busy} busyText="Updating...">Update Password</SubmitButton>
    </form>
  );
}
