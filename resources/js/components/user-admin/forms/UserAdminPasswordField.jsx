import { useEffect, useState } from "react";

export default function UserAdminPasswordField({
  id,
  label,
  value,
  onChange,
  disabled = false,
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!value) setVisible(false);
  }, [value]);

  const action = visible ? "Hide" : "Show";

  return (
    <div className="user-admin-password-control">
      <label htmlFor={id}>{label}</label>

      <div className="user-admin-password-field">
        <input
          id={id}
          type={visible ? "text" : "password"}
          autoComplete="new-password"
          minLength="6"
          value={value}
          onChange={onChange}
          disabled={disabled}
          required
        />

        <button
          type="button"
          className="user-admin-password-toggle"
          aria-label={`${action} ${label.toLowerCase()}`}
          aria-pressed={visible}
          aria-controls={id}
          onClick={() => setVisible((current) => !current)}
          disabled={disabled}
        >
          {action}
        </button>
      </div>
    </div>
  );
}
