import React, {
  useEffect,
  useState,
} from "react";
import {
  ROLE_DASHBOARDS,
  routeForRole,
} from "../../../config/roleDashboardConfig.js";
import AppLoadingScreen from "../AppLoadingScreen.jsx";
import RoleDashboardContent from "./RoleDashboardContent.jsx";
import {
  loadRoleDashboard,
  roleAdjustStock,
  roleCreatePurchaseOrder,
  roleCreateSupplier,
  roleStockIn,
  roleUpdatePurchaseOrderStatus,
  roleUpdateSalesOrderStatus,
  roleUpdateSupplier,
} from "../../../services/shared/roleDashboardApi.js";
import "../../../../css/shared/role-dashboard.css";

export default function RoleDashboardShell({
  roleKey,
  previewMode = false,
}) {
  const config = ROLE_DASHBOARDS[roleKey];
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem("wbo-ui-theme");

    if (saved === "dark" || saved === "light") {
      return saved;
    }

    return window.matchMedia?.(
      "(prefers-color-scheme: dark)",
    ).matches
      ? "dark"
      : "light";
  });

  useEffect(() => {
    localStorage.setItem("wbo-ui-theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((current) =>
      current === "dark" ? "light" : "dark",
    );
  };

  const [session, setSession] =
    useState(null);
  const [
    activeModule,
    setActiveModule,
  ] = useState("Overview");
  const [data, setData] = useState(null);
  const [loading, setLoading] =
    useState(true);
  const [actionBusy, setActionBusy] =
    useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] =
    useState("");
  const [reloadToken, setReloadToken] =
    useState(0);

  useEffect(() => {
    let cancelled = false;

    async function loadPage() {
      setLoading(true);
      setError("");

      try {
        const response = await fetch(
          "/api/session/status",
          {
            credentials: "same-origin",
            headers: {
              Accept:
                "application/json",
            },
          },
        );

        const sessionData =
          await response
            .json()
            .catch(() => ({}));

        if (cancelled) return;

        if (
          !response.ok ||
          sessionData.authenticated !==
            true
        ) {
          window.location.href =
            "/login";
          return;
        }

        const allowed = previewMode
          ? sessionData.role ===
            "super_admin"
          : sessionData.role ===
            roleKey;

        if (!allowed) {
          window.location.href =
            sessionData.role ===
            "super_admin"
              ? "/super-admin"
              : routeForRole(
                  sessionData.role,
                );
          return;
        }

        setSession(sessionData);

        if (config?.liveData === true) {
          const roleData =
            await loadRoleDashboard(
              roleKey,
              previewMode,
            );

          if (!cancelled) {
            setData({
              ...roleData,
              live: true,
            });
          }
        } else if (!cancelled) {
          setData({
            live: false,
            role: roleKey,
          });
        }
      } catch (requestError) {
        if (cancelled) return;

        if (
          requestError.status === 401
        ) {
          window.location.href =
            "/login";
          return;
        }

        if (
          requestError.status === 403
        ) {
          window.location.href =
            previewMode
              ? "/super-admin"
              : routeForRole(roleKey);
          return;
        }

        setError(
          requestError.message ||
            "Unable to load this role dashboard.",
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadPage();

    return () => {
      cancelled = true;
    };
  }, [
    config?.liveData,
    previewMode,
    reloadToken,
    roleKey,
  ]);

  const refresh = () => {
    setReloadToken(
      (value) => value + 1,
    );
  };

  const runAction = async (
    action,
    successFallback,
  ) => {
    if (previewMode || actionBusy) {
      return;
    }

    setActionBusy(true);
    setError("");
    setNotice("");

    try {
      const result = await action();

      setNotice(
        result?.message ||
          successFallback,
      );

      refresh();

      return result;
    } catch (requestError) {
      setError(
        requestError.message ||
          "The role action could not be completed.",
      );
      throw requestError;
    } finally {
      setActionBusy(false);
    }
  };

  const handleStockIn = (form) =>
    runAction(
      () => roleStockIn(form),
      "Stock received successfully.",
    );

  const handleAdjustment = (form) =>
    runAction(
      () => roleAdjustStock(form),
      "Inventory adjustment saved.",
    );

  const handleCreateSupplier = (
    form,
  ) =>
    runAction(
      () => roleCreateSupplier(form),
      "Supplier added successfully.",
    );

  const handleUpdateSupplier = (
    supplierId,
    form,
  ) =>
    runAction(
      () =>
        roleUpdateSupplier(
          supplierId,
          form,
        ),
      "Supplier updated successfully.",
    );

  const handleCreatePurchaseOrder = (
    form,
  ) =>
    runAction(
      () =>
        roleCreatePurchaseOrder(form),
      "Purchase order created.",
    );

  const handlePurchaseOrderStatus = (
    poId,
    action,
  ) =>
    runAction(
      () =>
        roleUpdatePurchaseOrderStatus(
          poId,
          action,
        ),
      "Purchase order updated.",
    );

  const handleSalesOrderStatus = (
    orderId,
    action,
  ) =>
    runAction(
      () =>
        roleUpdateSalesOrderStatus(
          orderId,
          action,
        ),
      "Sales order updated.",
    );
  async function logout() {
    try {
      const csrf =
        document
          .querySelector(
            'meta[name="csrf-token"]',
          )
          ?.getAttribute("content") ??
        "";

      await fetch("/logout", {
        method: "POST",
        credentials: "same-origin",
        headers: {
          Accept:
            "application/json",
          "Content-Type":
            "application/json",
          "X-CSRF-TOKEN": csrf,
        },
        body: JSON.stringify({
          reason: "manual",
        }),
      });
    } finally {
      window.location.href =
        "/login";
    }
  }

  const exitPreview = () => {
    window.location.href =
      "/super-admin";
  };

  if (!config) {
    return (
      <main className="role-dashboard-state">
        Unknown role dashboard.
      </main>
    );
  }

  if (loading) {
    return (
      <AppLoadingScreen
        label={`Loading ${config.title}...`}
        theme={theme}
      />
    );
  }

  return (
    <div
      data-theme={theme}
      className={`role-dashboard-layout app-page-enter ${
        previewMode
          ? "is-preview"
          : ""
      }`}
    >
      <aside className="role-dashboard-sidebar">
        <div className="role-dashboard-brand">
          <strong>
            WalangBrownOut
          </strong>
          <span>{config.title}</span>
        </div>

        <nav
          className="role-dashboard-nav"
          aria-label={`${config.title} navigation`}
        >
          <button
            type="button"
            className={
              activeModule ===
              "Overview"
                ? "is-active"
                : ""
            }
            onClick={() =>
              setActiveModule(
                "Overview",
              )
            }
          >
            Overview
          </button>

          {config.modules.map(
            (module) => (
              <button
                key={module}
                type="button"
                className={
                  activeModule ===
                  module
                    ? "is-active"
                    : ""
                }
                onClick={() =>
                  setActiveModule(
                    module,
                  )
                }
              >
                {module}
              </button>
            ),
          )}
        </nav>

        <button
          type="button"
          className="role-dashboard-logout"
          onClick={
            previewMode
              ? exitPreview
              : logout
          }
        >
          {previewMode
            ? "Exit preview"
            : "Sign out"}
        </button>
      </aside>

      <main className="role-dashboard-main">
        {previewMode && (
          <div
            className="role-preview-banner"
            role="status"
          >
            <div>
              <strong>
                Preview Mode:{" "}
                {config.title}
              </strong>
              <span>
                You are still signed in
                as Super Admin. This
                workspace is read-only.
              </span>
            </div>

            <button
              type="button"
              onClick={exitPreview}
            >
              Exit Preview
            </button>
          </div>
        )}

        <header className="role-dashboard-header">
          <div>
            <span>
              {previewMode
                ? "Role Preview"
                : "Role Workspace"}
            </span>
            <h1>
              {activeModule ===
              "Overview"
                ? config.title
                : activeModule}
            </h1>
            <p>{config.subtitle}</p>
          </div>

          <div className="role-dashboard-user">
            <button
              type="button"
              className="role-dashboard-theme-toggle"
              onClick={toggleTheme}
              aria-label={
                theme === "dark"
                  ? "Switch to light mode"
                  : "Switch to dark mode"
              }
              title={
                theme === "dark"
                  ? "Light mode"
                  : "Dark mode"
              }
            >
              {theme === "dark" ? "\u2600" : "\u263E"}
            </button>
            <strong>
              {session?.name ||
                config.title}
            </strong>
            <small>
              {previewMode
                ? "Signed in as Super Admin"
                : config.title}
            </small>
          </div>
        </header>

        {notice && (
          <div
            className="role-live-notice"
            role="status"
          >
            {notice}
          </div>
        )}

        {error && (
          <div
            className="role-live-error"
            role="alert"
          >
            {error}
            <button
              type="button"
              className="role-live-retry"
              onClick={refresh}
            >
              Retry
            </button>
          </div>
        )}

        {!error && (
          <RoleDashboardContent
            roleKey={roleKey}
            activeModule={
              activeModule
            }
            data={data}
            previewMode={
              previewMode
            }
            busy={actionBusy}
            onStockIn={
              handleStockIn
            }
            onAdjustment={
              handleAdjustment
            }
            onCreateSupplier={
              handleCreateSupplier
            }
            onUpdateSupplier={
              handleUpdateSupplier
            }
            onCreatePurchaseOrder={
              handleCreatePurchaseOrder
            }
            onPurchaseOrderStatus={
              handlePurchaseOrderStatus
            }
            onSalesOrderStatus={
              handleSalesOrderStatus
            }
            theme={theme}
          />
        )}
      </main>
    </div>
  );
}