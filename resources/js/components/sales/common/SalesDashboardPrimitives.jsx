import {
  formatMoney,
  formatNumber,
} from "../utils/salesFormatters.js";

export function SalesEmpty({ text }) {
  return (
    <div className="sales-role-empty">
      {text}
    </div>
  );
}

export function SalesSection({
  title,
  description,
  children,
}) {
  return (
    <section className="sales-role-panel">
      <header className="sales-role-head">
        <div>
          <h2>{title}</h2>
          {description && <p>{description}</p>}
        </div>
      </header>
      {children}
    </section>
  );
}

export function SalesMetrics({
  metrics = {},
  manager,
}) {
  const cards = [
    ["Pending", metrics.pending_orders],
    ["Processing", metrics.processing_orders],
    ["Fulfilled", metrics.fulfilled_orders],
    ["Unfulfilled", metrics.unfulfilled_orders],
    ["Customers", metrics.customers],
  ];

  if (manager) {
    cards.push(
      [
        "Monthly Revenue",
        formatMoney(metrics.monthly_revenue),
      ],
      [
        "Monthly Fulfilled",
        metrics.monthly_fulfilled,
      ],
    );
  }

  return (
    <div className="sales-role-metrics">
      {cards.map(([label, value]) => (
        <article
          className="sales-role-metric"
          key={label}
        >
          <span>{label}</span>
          <strong>
            {typeof value === "number"
              ? formatNumber(value)
              : value}
          </strong>
        </article>
      ))}
    </div>
  );
}

export function SalesAlerts({ alerts = [] }) {
  if (!alerts.length) {
    return (
      <SalesEmpty text="No current sales alerts." />
    );
  }

  return (
    <div className="sales-role-alerts">
      {alerts.map((alert, index) => (
        <article
          className={`sales-role-alert tone-${alert.tone || "info"}`}
          key={`${alert.title}-${index}`}
        >
          <strong>{alert.title}</strong>
          <p>{alert.message}</p>
        </article>
      ))}
    </div>
  );
}
