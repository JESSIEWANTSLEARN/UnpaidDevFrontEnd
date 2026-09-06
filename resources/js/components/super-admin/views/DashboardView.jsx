import React from "react";
import Icon from "../Icon.jsx";
import { number, formatDate, stockState } from "../../../utils/super-admin/superAdminUtils.js";
import { EmptyState, StatCard, ProductName, EmptyTable } from "../common/AdminCommon.jsx";

function Dashboard({ data, setActiveMenu }) {
  const { metrics = {}, products = [], categories = [], notifications = [], audit_logs: auditLogs = [], stock_trend: stockTrend = [] } = data;
  const lowStockThreshold = Number(data.low_stock_threshold || 10);
  const maxStock = Math.max(1, ...products.map((product) => Number(product.available_stock || 0)));
  const recentProducts = products.slice(0, 8);
  const recentAudit = auditLogs.slice(0, 5);

  return (
    <>
      <div className="stat-grid stat-grid-6">
        <StatCard title="Total Products" value={number(metrics.total_products)} icon="package" accent="purple" />
        <StatCard title="Low Stock Items" value={number(metrics.low_stock_items)} icon="warning" accent="orange" />
        <StatCard title="Out of Stock" value={number(metrics.out_of_stock)} icon="close-circle" accent="red" />
        <StatCard title="Total Suppliers" value={number(metrics.total_suppliers)} icon="truck" accent="blue" />
        <StatCard title="Pending Orders" value={number(metrics.pending_orders)} icon="cart" accent="green" />
        <StatCard title="Total Users" value={number(metrics.total_users)} icon="users" accent="teal" />
      </div>

      <UserActivityPanel activity={data.user_activity} />

      <div className="ops-panel dashboard-inventory-panel">
        <div className="panel-head">
          <h2>Inventory Overview</h2>
          <button type="button" className="panel-link" onClick={() => setActiveMenu("Inventory")}>View All →</button>
        </div>
        <div className="table-wrap">
          <table className="ops-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>SKU</th>
                <th>Category</th>
                <th>Stock Level</th>
                <th>Status</th>
                <th>Last Updated</th>
              </tr>
            </thead>
            <tbody>
              {recentProducts.length === 0 ? (
                <EmptyTable colSpan={6} text="No products found." />
              ) : recentProducts.map((product) => {
                const status = stockState(product.available_stock, lowStockThreshold);
                const width = `${Math.max(3, (Number(product.available_stock || 0) / maxStock) * 100)}%`;
                return (
                  <tr key={product.product_id}>
                    <td><ProductName product={product} /></td>
                    <td>{product.sku}</td>
                    <td>{product.category}</td>
                    <td><span className="stock-bar" style={{ width }} />{number(product.available_stock)}</td>
                    <td><span className={`status-badge ${status.className}`}>{status.label}</span></td>
                    <td>{formatDate(product.updated_at)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="table-footer">
          <span>Showing {recentProducts.length} of {products.length} products</span>
        </div>
      </div>

      <div className="panel-grid">
        <TrendPanel trend={stockTrend} />
        <CategoryPanel categories={categories} totalProducts={Number(metrics.total_products || 0)} />
      </div>

      <div className="panel-grid panel-grid-3">
        <AlertsPanel data={data} setActiveMenu={setActiveMenu} />
        <RecentActivity auditLogs={recentAudit} setActiveMenu={setActiveMenu} />
        <RecentAudit auditLogs={recentAudit} setActiveMenu={setActiveMenu} />
      </div>
    </>
  );
}


function UserActivityPanel({ activity = {} }) {
  const [range, setRange] = React.useState(7);

  const activityMetrics = activity.metrics ?? {};
  const daily =
    range === 30
      ? activity.daily_30 ?? []
      : activity.daily_7 ?? [];

  const hourly = activity.hourly_today ?? [];

  const activeValues = daily.map((item) =>
    Number(item.active_users || 0)
  );

  const maxActive = Math.max(
    1,
    ...activeValues
  );

  const lineWidth = 560;
  const lineHeight = 170;
  const linePadding = 16;

  const lineStep =
    daily.length > 1
      ? (lineWidth - linePadding * 2) /
        (daily.length - 1)
      : 0;

  const points = daily.map((item, index) => {
    const x =
      linePadding + index * lineStep;

    const y =
      lineHeight -
      linePadding -
      (Number(item.active_users || 0) /
        maxActive) *
        (lineHeight - linePadding * 2);

    return [x, y];
  });

  const pointString = points
    .map(([x, y]) => `${x},${y}`)
    .join(" ");

  const maxHourly = Math.max(
    1,
    ...hourly.map((item) =>
      Number(item.count || 0)
    )
  );

  const visibleHourly = hourly.filter(
    (item) =>
      Number(item.hour) % 2 === 0
  );

  const formatMetric = (value) =>
    Number(value || 0).toLocaleString();

  return (
    <section className="ops-panel padded user-activity-panel">
      <div className="panel-head user-activity-head">
        <div>
          <h2>User Activity</h2>
          <span>
            Authenticated sessions {"\u00B7"} Asia/Manila
          </span>
        </div>

        <div
          className="user-activity-range"
          aria-label="User activity range"
        >
          <button
            type="button"
            className={range === 7 ? "is-active" : ""}
            onClick={() => setRange(7)}
          >
            7 Days
          </button>

          <button
            type="button"
            className={range === 30 ? "is-active" : ""}
            onClick={() => setRange(30)}
          >
            30 Days
          </button>
        </div>
      </div>

      <div className="user-activity-kpis">
        <div className="user-activity-kpi">
          <span>Active Users Today</span>
          <strong>
            {formatMetric(
              activityMetrics.active_users_today
            )}
          </strong>
          <small>Unique authenticated users</small>
        </div>

        <div className="user-activity-kpi">
          <span>Sessions Today</span>
          <strong>
            {formatMetric(
              activityMetrics.sessions_today
            )}
          </strong>
          <small>Login sessions started today</small>
        </div>

        <div className="user-activity-kpi">
          <span>Currently Online</span>
          <strong>
            {formatMetric(
              activityMetrics.currently_online
            )}
          </strong>
          <small>Active within the last 5 minutes</small>
        </div>

        <div className="user-activity-kpi">
          <span>Peak Activity Hour</span>
          <strong className="user-activity-time-value">
            {activityMetrics.peak_activity_hour ||
              "No activity"}
          </strong>
          <small>
            {formatMetric(
              activityMetrics.peak_activity_count
            )}{" "}
            session activity point(s)
          </small>
        </div>
      </div>

      <div className="user-activity-charts">
        <div className="user-activity-chart-card">
          <div className="user-activity-chart-title">
            <div>
              <strong>
                Daily Active Users
              </strong>
              <span>
                Unique users by local date
              </span>
            </div>

            <small>
              {range}-day view
            </small>
          </div>

          {daily.length === 0 ? (
            <EmptyState text="No session activity yet." />
          ) : (
            <>
              <div className="user-activity-line-scroll">
                <svg
                  viewBox={`0 0 ${lineWidth} ${lineHeight}`}
                  className="user-activity-line-chart"
                  role="img"
                  aria-label={`Daily active users for the last ${range} days`}
                >
                  <line
                    x1={linePadding}
                    y1={lineHeight - linePadding}
                    x2={lineWidth - linePadding}
                    y2={lineHeight - linePadding}
                    stroke="var(--border)"
                    strokeWidth="1"
                  />

                  <polyline
                    points={pointString}
                    fill="none"
                    stroke="var(--primary)"
                    strokeWidth="3"
                    strokeLinejoin="round"
                    strokeLinecap="round"
                  />

                  {points.map(
                    ([x, y], index) => (
                      <g
                        key={`${daily[index]?.date}-${index}`}
                      >
                        <circle
                          cx={x}
                          cy={y}
                          r="4"
                          fill="var(--primary)"
                        />

                        <title>
                          {daily[index]?.label}:{" "}
                          {daily[index]?.active_users} active user(s)
                        </title>
                      </g>
                    )
                  )}
                </svg>
              </div>

              <div
                className={`user-activity-date-labels ${
                  range === 30
                    ? "is-thirty"
                    : ""
                }`}
              >
                {daily.map((item, index) => {
                  const show =
                    range === 7 ||
                    index === 0 ||
                    index === daily.length - 1 ||
                    index % 5 === 0;

                  return (
                    <span key={item.date}>
                      {show
                        ? range === 7
                          ? item.short_label
                          : item.label
                        : ""}
                    </span>
                  );
                })}
              </div>
            </>
          )}
        </div>

        <div className="user-activity-chart-card">
          <div className="user-activity-chart-title">
            <div>
              <strong>Activity by Hour</strong>
              <span>
                Today's session activity
              </span>
            </div>

            <small>
              {activityMetrics.peak_activity_hour
                ? `Peak ${activityMetrics.peak_activity_hour}`
                : "No peak yet"}
            </small>
          </div>

          <div className="user-activity-bars">
            {visibleHourly.map((item) => {
              const height =
                Math.max(
                  Number(item.count || 0) > 0
                    ? 12
                    : 3,
                  (Number(item.count || 0) /
                    maxHourly) *
                    100
                );

              return (
                <div
                  className="user-activity-bar-column"
                  key={item.hour}
                >
                  <div className="user-activity-bar-track">
                    <span
                      className="user-activity-bar"
                      style={{
                        height: `${height}%`,
                      }}
                      title={`${item.label}: ${item.count} activity point(s)`}
                    />
                  </div>

                  <span>{item.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="user-activity-footnote">
        <span>
          30-day tracked sessions:{" "}
          <strong>
            {formatMetric(
              activityMetrics.tracked_sessions_30d
            )}
          </strong>
        </span>

        <span>
          Distinct users:{" "}
          <strong>
            {formatMetric(
              activityMetrics.distinct_users_30d
            )}
          </strong>
        </span>

        <span>
          Anonymous landing-page visitors are not included yet.
        </span>
      </div>
    </section>
  );
}
function TrendPanel({ trend }) {
  const values = trend.map((item) => Number(item.net_movement || 0));
  const maxAbs = Math.max(1, ...values.map((value) => Math.abs(value)));
  const width = 360;
  const height = 140;
  const step = values.length > 1 ? width / (values.length - 1) : width;
  const points = values.map((value, index) => {
    const x = index * step;
    const y = 70 - (value / maxAbs) * 55;
    return [x, y];
  });
  const pointString = points.map(([x, y]) => `${x},${y}`).join(" ");

  return (
    <div className="ops-panel padded">
      <div className="panel-head">
        <h2>Stock Movement (Last 6 Weeks)</h2>
        <span>Based on WBO_Transactions</span>
      </div>
      <div className="chart-body">
        {trend.length === 0 ? <EmptyState text="No transaction history yet." /> : (
          <>
            <svg viewBox="0 0 360 140" className="line-chart">
              <line x1="0" y1="70" x2="360" y2="70" stroke="var(--border)" strokeWidth="1" />
              <polyline points={pointString} fill="none" stroke="var(--primary)" strokeWidth="3" />
              {points.map(([x, y], index) => <circle key={`${x}-${index}`} cx={x} cy={y} r="4" fill="var(--primary)" />)}
            </svg>
            <div className="line-chart-labels">
              {trend.map((item) => <span key={item.label}>{item.label}</span>)}
            </div>
            <div className="line-chart-legend">
              <span className="line-chart-legend-item"><span className="legend-dot" style={{ background: "var(--primary)" }} />Net quantity movement</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function CategoryPanel({ categories, totalProducts }) {
  const palette = ["var(--primary)", "var(--accent-mint)", "var(--accent-orange)", "var(--accent-purple)", "var(--muted-soft)"];
  const top = categories.slice(0, 5);
  let cursor = 0;
  const segments = top.map((item, index) => {
    const percent = totalProducts > 0 ? (Number(item.product_count || 0) / totalProducts) * 100 : 0;
    const start = cursor;
    cursor += percent;
    return `${palette[index]} ${start}% ${cursor}%`;
  });
  const background = segments.length ? `conic-gradient(${segments.join(", ")})` : "var(--donut-track)";

  return (
    <div className="ops-panel padded">
      <div className="panel-head"><h2>Category Distribution</h2></div>
      <div className="chart-body donut-row">
        <div className="dynamic-donut" style={{ background }}>
          <div className="dynamic-donut-center"><strong>{number(totalProducts)}</strong><span>items</span></div>
        </div>
        <ul className="donut-legend">
          {top.length === 0 ? <li>No categories yet</li> : top.map((item, index) => {
            const percent = totalProducts > 0 ? (Number(item.product_count || 0) / totalProducts) * 100 : 0;
            return (
              <li key={item.category}>
                <span className="legend-dot" style={{ background: palette[index] }} />
                {item.category}
                <strong>{percent.toFixed(1)}%</strong>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

function AlertsPanel({ data, setActiveMenu }) {
  const { metrics = {}, notifications = [] } = data;
  const unread = notifications.filter((item) => item.status === "UNREAD").slice(0, 3);

  const fallback = [
    Number(metrics.low_stock_items || 0) > 0 && { title: "Low Stock Alert", text: `${number(metrics.low_stock_items)} product(s) are low on stock.`, tone: "warn", icon: "warning", menu: "Inventory" },
    Number(metrics.out_of_stock || 0) > 0 && { title: "Out of Stock Alert", text: `${number(metrics.out_of_stock)} product(s) are out of stock.`, tone: "bad", icon: "close-circle", menu: "Inventory" },
    Number(metrics.open_purchase_orders || 0) > 0 && { title: "Open Purchase Orders", text: `${number(metrics.open_purchase_orders)} purchase order(s) are still open.`, tone: "info", icon: "clock", menu: "Purchase Orders" },
  ].filter(Boolean);

  const rows = unread.length > 0
    ? unread.map((item) => ({
        title: `${item.alert_tier} Alert`,
        text: item.product_name ? `${item.product_name}${item.batch_number ? ` · ${item.batch_number}` : ""}` : `Notification #${item.notification_id}`,
        tone: item.alert_tier === "Red" ? "bad" : item.alert_tier === "Orange" ? "warn" : "info",
        icon: item.alert_tier === "Red" ? "close-circle" : "warning",
        menu: "Inventory",
      }))
    : fallback;

  return (
    <div className="ops-panel">
      <div className="panel-head"><h2>Alerts & Notifications</h2></div>
      {rows.length === 0 ? <EmptyState text="No active alerts." /> : rows.map((row, index) => (
        <div className={`list-item tone-${row.tone}`} key={`${row.title}-${index}`}>
          <span className="list-icon"><Icon name={row.icon} size={16} /></span>
          <div className="list-body"><strong>{row.title}</strong><p>{row.text}</p></div>
          <button type="button" className="list-action" onClick={() => setActiveMenu(row.menu)}>View</button>
        </div>
      ))}
    </div>
  );
}

function RecentActivity({ auditLogs, setActiveMenu }) {
  return (
    <div className="ops-panel">
      <div className="panel-head"><h2>Recent Activity</h2></div>
      {auditLogs.length === 0 ? <EmptyState text="No activity recorded yet." /> : auditLogs.map((log) => (
        <ActivityItem key={log.log_id} icon="user" title={`${log.user_name || "System"}: ${log.action}`} time={formatDate(log.created_at)} type="success" />
      ))}
      {auditLogs.length > 0 && <button type="button" className="panel-link panel-link-block" onClick={() => setActiveMenu("Audit Logs")}>View All Activity →</button>}
    </div>
  );
}

function RecentAudit({ auditLogs, setActiveMenu }) {
  return (
    <div className="ops-panel">
      <div className="panel-head"><h2>Recent Audit Logs</h2></div>
      {auditLogs.length === 0 ? <EmptyState text="No audit logs yet." /> : auditLogs.map((log) => (
        <AuditItem key={log.log_id} user={log.user_name || "System"} action={log.action} ip={log.ip_address || "—"} time={formatDate(log.created_at)} />
      ))}
      {auditLogs.length > 0 && <button type="button" className="panel-link panel-link-block" onClick={() => setActiveMenu("Audit Logs")}>View All Audit Logs →</button>}
    </div>
  );
}


function ActivityItem({ icon, title, time, type }) {
  return (
    <div className="activity-row">
      <div className="activity-avatar"><Icon name={icon} size={15} /></div>
      <div className="list-body"><strong>{title}</strong><span className="activity-time">{time}</span></div>
      <span className={`activity-status ${type}`}>{type === "success" ? "✓" : "•"}</span>
    </div>
  );
}

function AuditItem({ user, action, ip, time }) {
  return (
    <div className="audit-row">
      <div className="audit-user">{user}</div>
      <div className="audit-action">{action}</div>
      <div className="audit-ip">IP: {ip}</div>
      <div className="audit-time">{time}</div>
    </div>
  );
}


export default Dashboard;
