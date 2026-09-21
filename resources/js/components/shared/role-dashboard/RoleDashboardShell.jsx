import React from "react";
import { ROLE_DASHBOARDS } from "../../../config/roleDashboardConfig.js";
import useRoleDashboard from "../../../hooks/role-dashboard/useRoleDashboard.js";
import AppLoadingScreen from "../AppLoadingScreen.jsx";
import RoleDashboardContent from "./RoleDashboardContent.jsx";
import RoleDashboardMessages from "./feedback/RoleDashboardMessages.jsx";
import RoleDashboardHeader from "./layout/RoleDashboardHeader.jsx";
import RoleDashboardSidebar from "./layout/RoleDashboardSidebar.jsx";
import RolePreviewBanner from "./layout/RolePreviewBanner.jsx";
import "../../../../css/shared/role-dashboard.css";

export default function RoleDashboardShell({
  roleKey,
  previewMode = false,
}) {
  const config = ROLE_DASHBOARDS[roleKey];
  const {
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
    handleCreateSupplier,
    handleUpdateSupplier,
    handleCreatePurchaseOrder,
    handlePurchaseOrderStatus,
    handleSalesOrderStatus,
    logout,
    exitPreview,
  } = useRoleDashboard({
    roleKey,
    previewMode,
    config,
  });

  const roleThemeStyle = {
    "--role-accent": config?.accent ?? "#2563eb",
    "--role-accent-rgb":
      config?.accentRgb ?? "37 99 235",
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
      data-role={roleKey}
      style={roleThemeStyle}
      className={`role-dashboard-layout app-page-enter ${
        previewMode ? "is-preview" : ""
      }`}
    >
      <RoleDashboardSidebar
        config={config}
        activeModule={activeModule}
        onModuleChange={setActiveModule}
        previewMode={previewMode}
        onExitPreview={exitPreview}
        onLogout={logout}
      />

      <main className="role-dashboard-main">
        {previewMode && (
          <RolePreviewBanner
            title={config.title}
            onExit={exitPreview}
          />
        )}

        <RoleDashboardHeader
          config={config}
          activeModule={activeModule}
          previewMode={previewMode}
          theme={theme}
          onToggleTheme={toggleTheme}
          userName={session?.name || config.title}
        />

        <RoleDashboardMessages
          notice={notice}
          error={error}
          onRetry={refresh}
        />

        {!error && (
          <RoleDashboardContent
            roleKey={roleKey}
            activeModule={activeModule}
            data={data}
            previewMode={previewMode}
            busy={actionBusy}
            onStockIn={handleStockIn}
            onAdjustment={handleAdjustment}
            onCreateSupplier={handleCreateSupplier}
            onUpdateSupplier={handleUpdateSupplier}
            onCreatePurchaseOrder={
              handleCreatePurchaseOrder
            }
            onPurchaseOrderStatus={
              handlePurchaseOrderStatus
            }
            onSalesOrderStatus={handleSalesOrderStatus}
            theme={theme}
          />
        )}
      </main>
    </div>
  );
}
