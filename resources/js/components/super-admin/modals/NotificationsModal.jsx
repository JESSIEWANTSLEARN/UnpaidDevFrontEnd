import React from "react";
import Icon from "../Icon.jsx";
import { EmptyState } from "../common/AdminCommon.jsx";
import { formatDate } from "../../../utils/super-admin/superAdminUtils.js";
import { ErrorMessage } from "./FormHelpers.jsx";

function tone(alertTier) {
  if (alertTier === "Red") return "tone-bad";
  if (
    alertTier === "Yellow" ||
    alertTier === "Orange"
  ) {
    return "tone-warn";
  }

  return "tone-info";
}

export default function NotificationsModal({
  busy,
  error,
  data,
  onNotificationStatus,
  onOpenNotification,
}) {
  const notifications = data?.notifications || [];

  const openItem = (item) => {
    if (busy) return;
    onOpenNotification?.(item);
  };

  return (
    <div className="admin-modal-body admin-notification-list">
      <ErrorMessage
        error={error}
        className="notification-error"
      />

      {notifications.length === 0 ? (
        <EmptyState text="No notifications found." />
      ) : (
        notifications.map((item) => {
          const navigable =
            item.related_product_id ||
            item.related_batch_id;

          return (
            <div
              className={`list-item ${tone(
                item.alert_tier,
              )} ${
                navigable ? "is-clickable" : ""
              }`}
              key={item.notification_id}
              role={navigable ? "button" : undefined}
              tabIndex={navigable ? 0 : undefined}
              onClick={() =>
                navigable && openItem(item)
              }
              onKeyDown={(event) => {
                if (
                  navigable &&
                  (event.key === "Enter" ||
                    event.key === " ")
                ) {
                  event.preventDefault();
                  openItem(item);
                }
              }}
            >
              <span className="list-icon">
                <Icon name="bell" size={16} />
              </span>

              <div className="list-body">
                <strong>
                  {item.alert_tier} Alert
                </strong>

                <p>
                  {item.product_name ||
                    "System notification"}
                  {item.batch_number
                    ? ` - Batch ${item.batch_number}`
                    : ""}
                </p>

                <span className="activity-time">
                  {formatDate(item.triggered_at)} -{" "}
                  {item.status}
                </span>

                {navigable && (
                  <small className="notification-open-hint">
                    Open related{" "}
                    {item.related_product_id
                      ? "product"
                      : "stock movement"}
                  </small>
                )}
              </div>

              <div
                className="notification-actions"
                onClick={(event) =>
                  event.stopPropagation()
                }
                onKeyDown={(event) =>
                  event.stopPropagation()
                }
              >
                {item.status === "UNREAD" && (
                  <button
                    className="btn-ghost btn-small"
                    type="button"
                    disabled={busy}
                    onClick={() =>
                      onNotificationStatus(
                        item.notification_id,
                        "ACKNOWLEDGED",
                      )
                    }
                  >
                    Acknowledge
                  </button>
                )}

                {item.status !== "RESOLVED" && (
                  <button
                    className="btn-primary btn-small"
                    type="button"
                    disabled={busy}
                    onClick={() =>
                      onNotificationStatus(
                        item.notification_id,
                        "RESOLVED",
                      )
                    }
                  >
                    Resolve
                  </button>
                )}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
