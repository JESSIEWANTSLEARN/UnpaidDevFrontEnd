import Icon from "../../super-admin/Icon.jsx";

export function UserAdminEmpty({ text }) {
  return (
    <div className="user-admin-empty">
      {text}
    </div>
  );
}

export function UserAdminMetrics({ metrics = {} }) {
  const cards = [
    ["Managed Accounts", metrics.total_users, "users"],
    ["Active", metrics.active_users, "user"],
    ["Pending", metrics.pending_users, "clock"],
    ["Disabled", metrics.disabled_users, "lock"],
    ["Active Sessions", metrics.active_sessions, "activity"],
    ["Staff", metrics.staff_accounts, "building"],
    ["Customers", metrics.customer_accounts, "users"],
  ];

  return (
    <div className="user-admin-metrics">
      {cards.map(([label, value, icon]) => (
        <article
          key={label}
          className="user-admin-metric"
        >
          <span className="user-admin-metric-icon" aria-hidden="true">
            <Icon name={icon} size={17} />
          </span>
          <span>{label}</span>
          <strong>
            {Number(value || 0).toLocaleString()}
          </strong>
        </article>
      ))}
    </div>
  );
}

export function UserAdminSection({
  title,
  description,
  children,
}) {
  return (
    <section className="user-admin-panel">
      <header className="user-admin-panel-head">
        <div>
          <h2>{title}</h2>
          {description && <p>{description}</p>}
        </div>
      </header>
      {children}
    </section>
  );
}
