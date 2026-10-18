import { readSessionStatus, VerifiedSessionContext } from "../../services/auth/sessionStatus.js";
import { mergeDashboardUpdate, importRefreshSections, queueDashboardRefresh } from "../../utils/dashboardRefresh.mjs";
import { useContext, useEffect, useRef, useState } from "react";
import { applyInventoryUpdate } from "../../utils/inventoryUpdates.mjs";
import {
  csrfFetch,
} from "../../config/api.js";
import { routeForRole } from "../../config/roleDashboardConfig.js";
import {
  loadRoleDashboard,
  roleAdjustStock,
  roleCreatePurchaseOrder,
  roleReceivePurchaseOrder,
  roleCreateSupplier,
  roleStockIn,
  roleWriteOffStock,
  roleUpdatePurchaseOrderStatus,
  roleUpdateSalesOrderStatus,
  roleUpdateSupplier,
} from "../../services/shared/roleDashboardApi.js";

export default function useRoleDashboard({
  roleKey,
  previewMode,
  config,
}) {
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

  const verifiedSession = useContext(VerifiedSessionContext);
  const [session, setSession] = useState(null);

  const roleModuleStorageKey =
    `wbo-role-active-module:${roleKey}`;

  const [activeModule, setActiveModule] =
    useState(() => {
      const savedModule =
        localStorage.getItem(
          roleModuleStorageKey
        );

      const allowedModules = [
        "Overview",
        ...(config?.modules || []),
      ];

      return savedModule &&
        allowedModules.includes(savedModule)
        ? savedModule
        : "Overview";
    });
  const [data, setData] = useState(null);
  const inventoryRevision = useRef(0);
  const refreshQueue = useRef(Promise.resolve());
  const [loading, setLoading] = useState(true);
  const [actionBusy, setActionBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    localStorage.setItem(
      roleModuleStorageKey,
      activeModule
    );
  }, [
    activeModule,
    roleModuleStorageKey,
  ]);

  useEffect(() => {
    let cancelled = false;
    const loadRevision = inventoryRevision.current;

    async function loadPage() {
      setLoading(true);
      setError("");

      try {
        // Initial mount uses this page's gate result. Manual refresh rechecks.
        const { response, data: sessionData } = verifiedSession && reloadToken === 0
          ? { response: { ok: true }, data: verifiedSession }
          : await readSessionStatus();

        // Yield so StrictMode cleanup can detach its first mount before data loading.
        await Promise.resolve();
        if (cancelled) return;

        if (
          !response.ok ||
          sessionData.authenticated !== true
        ) {
          window.location.href = "/login";
          return;
        }

        const allowed = previewMode
          ? sessionData.role === "super_admin"
          : sessionData.role === roleKey;

        if (!allowed) {
          window.location.href =
            sessionData.role === "super_admin"
              ? "/super-admin"
              : routeForRole(sessionData.role);
          return;
        }

        setSession(sessionData);

        if (config?.liveData === true) {
          const roleData = await loadRoleDashboard(
            roleKey,
            previewMode,
          );

          if (!cancelled && loadRevision === inventoryRevision.current) {
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

        if (requestError.status === 401) {
          window.location.href = "/login";
          return;
        }

        if (requestError.status === 403) {
          window.location.href = previewMode
            ? "/super-admin"
            : routeForRole(roleKey);
          return;
        }

        if (loadRevision === inventoryRevision.current) {
          setError(
            requestError.message ||
              "Unable to load this role dashboard.",
          );
        }
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
    verifiedSession,
    config?.liveData,
    previewMode,
    reloadToken,
    roleKey,
  ]);

  const refresh = (result, sections = importRefreshSections(result)) => {
    if (result?.inventory_update) {
      inventoryRevision.current += 1;
      setData((current) => applyInventoryUpdate(current, result.inventory_update));
      return;
    }
    if (Array.isArray(sections) && sections.length) {
      inventoryRevision.current += 1;
      return queueDashboardRefresh(refreshQueue, inventoryRevision,
        () => loadRoleDashboard(roleKey, previewMode, sections),
        (response) => setData((current) => response.dashboard_update
          ? mergeDashboardUpdate(current, response.dashboard_update) : { ...response, live: true }),
        (err) => {
          if (err.status === 401 || err.status === 403) window.location.href = "/login";
          else setError("Saved, but the affected data could not be refreshed. Use Refresh. " + (err.message || ""));
        });
    }
    setReloadToken((value) => value + 1);
  };

  const runAction = async (action, successFallback, sections = null) => {
    if (previewMode || actionBusy) {
      return;
    }

    setActionBusy(true);
    setError("");
    setNotice("");

    try {
      const result = await action();

      setNotice(result?.message || successFallback);
      await refresh(result, sections);

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

  const handleWriteOff = (form) =>
    runAction(
      () => roleWriteOffStock(form),
      "Inventory write-off recorded.",
    );

  const handleCreateSupplier = (form) =>
    runAction(
      () => roleCreateSupplier(form),
      "Supplier added successfully.",
      ["suppliers"],
    );

  const handleUpdateSupplier = (supplierId, form) =>
    runAction(
      () => roleUpdateSupplier(supplierId, form),
      "Supplier updated successfully.",
      ["suppliers", "products", "purchase_orders"],
    );

  const handleCreatePurchaseOrder = (form) =>
    runAction(
      () => roleCreatePurchaseOrder(form),
      "Purchase order created.",
      ["purchase_orders"],
    );


  const handleReceivePurchaseOrder = (poId, form) =>
    runAction(
      () => roleReceivePurchaseOrder(poId, form),
      "Purchase-order delivery received.",
    );
  const handlePurchaseOrderStatus = (poId, action) =>
    runAction(
      () => roleUpdatePurchaseOrderStatus(poId, action),
      "Purchase order updated.",
      ["purchase_orders"],
    );

  const handleSalesOrderStatus = (orderId, action) =>
    runAction(
      () => roleUpdateSalesOrderStatus(orderId, action),
      "Sales order updated.",
      ["orders", "products", "customers", "product_performance"],
    );

  async function logout() {

    try {
      const response = await csrfFetch("/logout", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          reason: "manual",
        }),
      });
      if (!response.ok) throw new Error("Logout failed. Please try again.");
      window.dispatchEvent(new Event("wbo:logout-started"));
      window.location.href = "/login";
    } catch (error) {
      setError(error.message || "Logout failed. Please try again.");
    }
  }

  const exitPreview = () => {
    window.location.href = "/super-admin";
  };

  return {
    theme,
    toggleTheme,
    session,
    activeModule,
    setActiveModule,
    data,
    loading,
    actionBusy,
    error,
    notice,
    refresh,
    handleStockIn,
    handleAdjustment,
    handleWriteOff,
    handleCreateSupplier,
    handleUpdateSupplier,
    handleCreatePurchaseOrder,
    handleReceivePurchaseOrder,
    handlePurchaseOrderStatus,
    handleSalesOrderStatus,
    logout,
    exitPreview,
  };
}
