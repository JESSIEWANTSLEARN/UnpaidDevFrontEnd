import { useState } from "react";
import { labelUserRole } from "../utils/userAdminFormatters.js";

const EMPTY_CREATE = {
  name: "",
  email: "",
  contact_number: "",
  password: "",
  password_confirmation: "",
  role: "System_User",
  account_status: "active",
};

export default function CreateUserForm({
  roles,
  statuses,
  previewMode,
  busy,
  onCreate,
}) {
  const [form, setForm] = useState(EMPTY_CREATE);
  const [error, setError] = useState("");

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

    try {
      await onCreate(form);
      setForm(EMPTY_CREATE);
    } catch (requestError) {
      setError(
        requestError.message ||
          "Unable to create account.",
      );
    }
  };

  if (previewMode) {
    return (
      <div className="user-admin-readonly">
        Account creation is disabled in Super
        Admin preview mode.
      </div>
    );
  }

  return (
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
          Contact number
          <input
            value={form.contact_number}
            onChange={update("contact_number")}
          />
        </label>

        <label>
          Role
          <select
            value={form.role}
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
            onChange={update("account_status")}
          >
            {statuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </label>

        <label>
          Password
          <input
            type="password"
            minLength="6"
            value={form.password}
            onChange={update("password")}
            required
          />
        </label>

        <label>
          Confirm password
          <input
            type="password"
            minLength="6"
            value={form.password_confirmation}
            onChange={update("password_confirmation")}
            required
          />
        </label>
      </div>

      {error && (
        <p className="user-admin-error" role="alert">
          {error}
        </p>
      )}

      <button
        type="submit"
        className="user-admin-primary"
        disabled={busy}
      >
        {busy ? "Creating..." : "Create Account"}
      </button>
    </form>
  );
}
