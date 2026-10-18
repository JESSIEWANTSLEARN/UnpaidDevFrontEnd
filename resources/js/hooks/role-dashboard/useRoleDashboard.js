import { useEffect, useRef, useState } from "react";
import { applyInventoryUpdate } from "../../utils/inventoryUpdates.mjs";
import {
  backendUrl,
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
        const response = await fetch(
          backendUrl("/api/session/status"),
          {
            credentials: "include",
            headers: {
              Accept: "application/json",
            },
          },
        );

        const sessionData = await response
          .json()
          .catch(() => ({}));

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
    config?.liveData,
    previewMode,
    reloadToken,
    roleKey,
  ]);

  const refresh = (result) => {
    if (result?.inventory_update) {
      inventoryRevision.current += 1;
      setData((current) => applyInventoryUpdate(current, result.inventory_update));
      return;
    }
    setReloadToken((value) => value + 1);
  };

  const runAction = async (action, successFallback) => {
    if (previewMode || actionBusy) {
      return;
    }

    setActionBusy(true);
    setError("");
    setNotice("");

    try {
      const result = await action();

      setNotice(result?.message || successFallback);
      refresh(result);

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
    );

  const handleUpdateSupplier = (supplierId, form) =>
    runAction(
      () => roleUpdateSupplier(supplierId, form),
      "Supplier updated successfully.",
    );

  const handleCreatePurchaseOrder = (form) =>
    runAction(
      () => roleCreatePurchaseOrder(form),
      "Purchase order created.",
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
    );

  const handleSalesOrderStatus = (orderId, action) =>
    runAction(
      () => roleUpdateSalesOrderStatus(orderId, action),
      "Sales order updated.",
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
