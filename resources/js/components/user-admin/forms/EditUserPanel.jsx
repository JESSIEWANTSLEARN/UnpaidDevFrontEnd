import { useState } from "react";
import { UserAdminSection } from "../common/UserAdminPrimitives.jsx";
import { labelUserRole } from "../utils/userAdminFormatters.js";

export default function EditUserPanel({
  user,
  roles,
  statuses,
  currentUserId,
  busy,
  onClose,
  onSave,
}) {
  const [form, setForm] = useState({
    name: user.name || "",
    email: user.email || "",
    contact_number: user.contact_number || "",
    role: user.role,
    account_status: user.account_status,
  });
  const [error, setError] = useState("");

  const isSelf =
    Number(user.user_id) === Number(currentUserId);

  const update = (field) => (event) => {
    setForm((current) => ({
      ...current,
      [field]: event.target.value,
    }));
  };

  const submit = async (event) => {
    event.preventDefault();
    setError("");

    try {
      await onSave(user.user_id, form);
      onClose();
    } catch (requestError) {
      setError(
        requestError.message ||
          "Unable to update account.",
      );
    }
  };

  return (
    <UserAdminSection
      title={`Edit ${user.name}`}
      description={
        isSelf
          ? "You may edit your own contact details, but your own role and status are protected."
          : "Changing an account away from Active revokes its active sessions and trusted devices."
      }
    >
      <form className="user-admin-form" onSubmit={submit}>
        <div className="user-admin-form-grid">
          <label>
            Name
            <input
              value={form.name}
              onChange={update("name")}
              required
            />
          </label>

          <label>
            Email
            <input
              type="email"
              value={form.email}
              onChange={update("email")}
              required
            />
          </label>

          <label>
            Contact
            <input
              value={form.contact_number}
              onChange={update("contact_number")}
            />
          </label>

          <label>
            Role
            <select
              value={form.role}
              disabled={isSelf}
              onChange={update("role")}
            >
              {roles.map((role) => (
                <option key={role} value={role}>
                  {labelUserRole(role)}
                </option>
              ))}
            </select>
          </label>

          <label>
            Status
            <select
              value={form.account_status}
              disabled={isSelf}
              onChange={update("account_status")}
            >
              {statuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </label>
        </div>

        {error && (
          <p className="user-admin-error" role="alert">
            {error}
          </p>
        )}

        <div className="user-admin-actions">
          <button
            type="submit"
            className="user-admin-primary"
            disabled={busy}
          >
            {busy ? "Saving..." : "Save Changes"}
          </button>

          <button type="button" onClick={onClose}>
            Cancel
          </button>
        </div>
      </form>
    </UserAdminSection>
  );
}
