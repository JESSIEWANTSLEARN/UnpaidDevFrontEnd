import React from "react";
import { ErrorMessage, SubmitButton, submit } from "./FormHelpers.jsx";

export default function DeleteUserModal({
  busy,
  error,
  currentUser,
  selectedUser,
  deleteUserForm,
  setDeleteUserForm,
  onDeleteUser,
}) {
  if (!selectedUser) {
    return <div className="admin-modal-body"><p className="ops-subtext">No user selected.</p></div>;
  }

  const editingSelf = Number(selectedUser.user_id) === Number(currentUser?.user_id);
  const confirmed = deleteUserForm?.confirmation === "DELETE";

  return (
    <form className="admin-modal-body" onSubmit={(event) => submit(event, busy, onDeleteUser)}>
      <div className="danger-zone-card">
        <strong>Permanent account deletion</strong>
        <p>
          {selectedUser.name} ({selectedUser.email})
        </p>
        <p>
          Unused accounts with no protected business or audit history are permanently deleted.
          If protected history exists, the account is archived instead: access is revoked, history stays attached to the old user ID, and the previous email is released for a new registration.
        </p>
      </div>

      {editingSelf && (
        <p className="admin-form-error">
          You cannot delete the Super Admin account you are currently using.
        </p>
      )}

      <div className="admin-form-row">
        <label>Type DELETE to confirm</label>
        <input
          value={deleteUserForm?.confirmation || ""}
          autoComplete="off"
          placeholder="DELETE"
          onChange={(event) =>
            setDeleteUserForm((form) => ({
              ...form,
              confirmation: event.target.value,
            }))
          }
        />
      </div>

      <ErrorMessage error={error} />

      <SubmitButton
        busy={busy}
        busyText="Deleting..."
        disabled={editingSelf || !confirmed}
      >
        Delete Account Permanently
      </SubmitButton>
    </form>
  );
}