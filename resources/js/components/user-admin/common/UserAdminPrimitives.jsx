export function UserAdminEmpty({ text }) {
  return (
    <div className="user-admin-empty">
      {text}
    </div>
  );
}

export function UserAdminMetrics({ metrics = {} }) {
  const cards = [
    ["Managed Accounts", metrics.total_users],
    ["Active", metrics.active_users],
    ["Pending", metrics.pending_users],
    ["Disabled", metrics.disabled_users],
    ["Active Sessions", metrics.active_sessions],
    ["Staff", metrics.staff_accounts],
    ["Customers", metrics.customer_accounts],
  ];

  return (
    <div className="user-admin-metrics">
      {cards.map(([label, value]) => (
        <article
          key={label}
          className="user-admin-metric"
        >
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
