import React from "react";
import "../../../../css/shared/role-dashboard-data.css";
import SalesDashboardContent from "../../sales/SalesDashboardContent.jsx";
import UserAdminDashboardContent from "../../user-admin/UserAdminDashboardContent.jsx";
import FoundationOnlyContent from "./roles/FoundationOnlyContent.jsx";
import InventoryDashboardContent from "./roles/InventoryDashboardContent.jsx";
import OperationsDashboardContent from "./roles/OperationsDashboardContent.jsx";
import PurchasingDashboardContent from "./roles/PurchasingDashboardContent.jsx";
import WarehouseDashboardContent from "./roles/WarehouseDashboardContent.jsx";

export default function RoleDashboardContent({
  roleKey,
  activeModule,
  data,
  previewMode,
  busy,
  onStockIn,
  onAdjustment,
  onCreateSupplier,
  onUpdateSupplier,
  onCreatePurchaseOrder,
  onReceivePurchaseOrder,
  onPurchaseOrderStatus,
  onSalesOrderStatus,
  theme,
}) {
  if (roleKey === "User_Admin") {
    return (
      <UserAdminDashboardContent
        activeModule={activeModule}
        previewMode={previewMode}
        theme={theme}
      />
    );
  }

  if (!data?.live) {
    return (
      <FoundationOnlyContent
        activeModule={activeModule}
      />
    );
  }

  if (
    roleKey === "Sales_Manager" ||
    roleKey === "Sales_Staff"
  ) {
    return (
      <SalesDashboardContent
        roleKey={roleKey}
        activeModule={activeModule}
        data={data}
        previewMode={previewMode}
        busy={busy}
        onOrderStatus={onSalesOrderStatus}
      />
    );
  }

  if (roleKey === "Operations_Manager") {
    return (
      <OperationsDashboardContent
        activeModule={activeModule}
        data={data}
      />
    );
  }

  if (roleKey === "Warehouse_Admin") {
    return (
      <WarehouseDashboardContent
        activeModule={activeModule}
        data={data}
        previewMode={previewMode}
        busy={busy}
        onStockIn={onStockIn}
        onReceivePurchaseOrder={onReceivePurchaseOrder}
      />
    );
  }

  if (roleKey === "Inventory_Controller") {
    return (
      <InventoryDashboardContent
        activeModule={activeModule}
        data={data}
        previewMode={previewMode}
        busy={busy}
        onStockIn={onStockIn}
        onAdjustment={onAdjustment}
      />
    );
  }

  if (
    roleKey === "Purchasing_Manager" ||
    roleKey === "Purchasing_Staff"
  ) {
    return (
      <PurchasingDashboardContent
        roleKey={roleKey}
        activeModule={activeModule}
        data={data}
        previewMode={previewMode}
        busy={busy}
        onCreateSupplier={onCreateSupplier}
        onUpdateSupplier={onUpdateSupplier}
        onCreatePurchaseOrder={onCreatePurchaseOrder}
        onPurchaseOrderStatus={onPurchaseOrderStatus}
      />
    );
  }

  return (
    <FoundationOnlyContent
      activeModule={activeModule}
    />
  );
}
