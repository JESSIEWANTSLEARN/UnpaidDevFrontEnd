import React from "react";
import { backendUrl } from "../../../config/api.js";
import { Icon } from "../CustomerUi.jsx";

const Logo = backendUrl("/storage/site/Logo.png");

export default function CustomerHeader({ ctx }) {
  const {
    previewMode,
    mobileOpen,
    setMobileOpen,
    nav,
    tab,
    changeTab,
    handleSearch,
    search,
    setSearch,
    unreadNotificationCount,
    setNotificationOpen,
    notificationOpen,
    readAllNotifications,
    notificationBusy,
    notifications,
    readNotification,
    setTheme,
    theme,
    cartPulse,
    setCartOpen,
    cartCount,
    logout,
    busy,
    error,
    setError,
  } = ctx;

  // Product alerts open the product. Order alerts open My Orders.
  // Order notifications currently do not carry a related_order_id, so
  // the order number is read from the existing "Order #123" title/message.
  const orderIdFromNotification = (item) => {
    const text = `${item.title || ""} ${item.message || ""}`;
    const match = text.match(/order\s*#(\d+)/i);

    return match ? Number(match[1]) : null;
  };

  const openNotification = async (item) => {
    await readNotification(item.notification_id);
    setNotificationOpen(false);

    if (item.related_product_id) {
      sessionStorage.setItem(
        "wbo_notification_product_id",
        String(item.related_product_id),
      );
      changeTab("product");
      return;
    }

    const orderId = orderIdFromNotification(item);

    if (orderId) {
      sessionStorage.setItem(
        "wbo_notification_order_id",
        String(orderId),
      );
      changeTab("orders");
    }
  };

  return (
    <>
{previewMode && (
        <div className="customer-admin-preview-bar">
          <div>
            <strong>SUPER ADMIN - FULL CUSTOMER VIEW</strong>
            <span>
              You are still logged in as Super Admin. Private customer records and account-changing actions are protected.
            </span>
          </div>
          <div className="customer-admin-preview-actions">
            <a href="/">Landing Page</a>
            <a href="/super-admin">Back to Super Admin</a>
          </div>
        </div>
      )}

      <header className="customer-header">
        <div className="customer-header-inner">
          <button
            type="button"
            className="customer-mobile-menu"
            onClick={() => setMobileOpen((open) => !open)}
            aria-label={mobileOpen ? "Close navigation" : "Open navigation"}
            aria-expanded={mobileOpen}
          >
            <Icon name={mobileOpen ? "close" : "menu"} />
          </button>

          <button
            type="button"
            className="customer-brand"
            onClick={() => changeTab("dashboard")}
            aria-label="Walang Brownout home"
          >
            <img src={Logo} alt="" />
            <span>
              <small>Home Comfort Store</small>
              <strong>Walang Brownout</strong>
            </span>
          </button>

          <nav className="customer-desktop-nav" aria-label="Customer navigation">
            {nav.map(([id, label, icon]) => (
              <button
                type="button"
                key={id}
                className={tab === id ? "is-active" : ""}
                onClick={() => changeTab(id)}
              >
                <Icon name={icon} size={18} />
                <span>{label}</span>
              </button>
            ))}
          </nav>

          <form className="customer-header-search" onSubmit={handleSearch}>
            <Icon name="search" size={18} />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search products..."
              aria-label="Search products"
            />
          </form>

          <div className="customer-header-actions">
            {!previewMode && (
              <div className="customer-notification-wrap">
                <button
                  type="button"
                  className={`customer-icon-button customer-notification-button ${
                    unreadNotificationCount > 0
                      ? "has-unread"
                      : ""
                  }`}
                  onClick={() =>
                    setNotificationOpen(
                      (open) => !open
                    )
                  }
                  aria-label={`Notifications${
                    unreadNotificationCount
                      ? `, ${unreadNotificationCount} unread`
                      : ""
                  }`}
                  aria-expanded={notificationOpen}
                >
                  <Icon name="bell" />
                  {unreadNotificationCount > 0 && (
                    <span className="customer-notification-count">
                      {unreadNotificationCount > 9
                        ? "9+"
                        : unreadNotificationCount}
                    </span>
                  )}
                </button>

                {notificationOpen && (
                  <div className="customer-notification-panel">
                    <div className="customer-notification-head">
                      <div>
                        <span>UPDATES</span>
                        <h3>Notifications</h3>
                      </div>

                      <button
                        type="button"
                        onClick={readAllNotifications}
                        disabled={
                          notificationBusy ||
                          unreadNotificationCount === 0
                        }
                      >
                        Mark all read
                      </button>
                    </div>

                    <div className="customer-notification-list">
                      {notifications.length ? (
                        notifications.map((item) => (
                          <button
                            type="button"
                            key={item.notification_id}
                            className={`customer-notification-item ${
                              item.status === "UNREAD"
                                ? "is-unread"
                                : ""
                            }`}
                            onClick={() =>
                              openNotification(item)
                            }
                          >
                            <span
                              className={`customer-notification-dot tier-${String(
                                item.alert_tier || "Yellow"
                              ).toLowerCase()}`}
                            />

                            <span className="customer-notification-copy">
                              <strong>
                                {item.title ||
                                  "System update"}
                              </strong>
                              <small>
                                {item.message ||
                                  "You have a new update."}
                              </small>
                              <time>
                                {new Date(
                                  item.triggered_at
                                ).toLocaleString()}
                              </time>
                            </span>

                            {item.status === "UNREAD" && (
                              <span className="customer-notification-new">
                                NEW
                              </span>
                            )}
                          </button>
                        ))
                      ) : (
                        <div className="customer-notification-empty">
                          <Icon name="bell" size={23} />
                          <strong>You're all caught up</strong>
                          <span>No notifications yet.</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            <button
              type="button"
              className="customer-icon-button"
              onClick={() => setTheme((current) => (current === "dark" ? "light" : "dark"))}
              aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
            >
              <Icon name={theme === "dark" ? "sun" : "moon"} />
            </button>

            <button
              type="button"
              className={`customer-cart-button ${cartPulse ? "is-pulsing" : ""}`}
              onClick={() => setCartOpen(true)}
            >
              <Icon name="cart" size={20} />
              <span className="customer-cart-text">Cart</span>
              <span className="customer-cart-count" aria-live="polite">{cartCount}</span>
            </button>
          </div>
        </div>

        <form className="customer-mobile-search" onSubmit={handleSearch}>
          <Icon name="search" size={18} />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search products..."
            aria-label="Search products"
          />
        </form>

        {mobileOpen && (
          <nav className="customer-mobile-nav" aria-label="Mobile customer navigation">
            {nav.map(([id, label, icon]) => (
              <button
                type="button"
                key={id}
                className={tab === id ? "is-active" : ""}
                onClick={() => changeTab(id)}
              >
                <Icon name={icon} size={19} />
                <span>{label}</span>
              </button>
            ))}
            <button type="button" onClick={logout} disabled={busy}>
              <Icon name="logout" size={19} />
              <span>{previewMode ? "Back to Super Admin" : "Sign out"}</span>
            </button>
          </nav>
        )}
      </header>

      {error && (
        <div className="customer-error" role="alert">
          <span>{error}</span>
          <button type="button" onClick={() => setError("")} aria-label="Dismiss error">
            <Icon name="close" size={17} />
          </button>
        </div>
      )}
    </>
  );
}