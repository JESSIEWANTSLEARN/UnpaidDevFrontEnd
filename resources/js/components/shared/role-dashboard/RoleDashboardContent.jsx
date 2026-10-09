import { ROLE_WORKSPACES } from "../../../config/roleWorkspaceConfig.js";
import RoleFunctionDirectory from "./workspaces/RoleFunctionDirectory.jsx";
import RoleWorkspace from "./workspaces/RoleWorkspace.jsx";
import "../../../../css/shared/role-workspaces.css";
import React from "react";
import "../../../../css/shared/role-dashboard-data.css";
import SalesDashboardContent from "../../sales/SalesDashboardContent.jsx";
import UserAdminDashboardContent from "../../user-admin/UserAdminDashboardContent.jsx";
import FoundationOnlyContent from "./roles/FoundationOnlyContent.jsx";
import InventoryDashboardContent from "./roles/InventoryDashboardContent.jsx";
import OperationsDashboardContent from "./roles/OperationsDashboardContent.jsx";
import PurchasingDashboardContent from "./roles/PurchasingDashboardContent.jsx";
import WarehouseDashboardContent from "./roles/WarehouseDashboardContent.jsx";

function RoleModuleContent({
  roleKey,
  activeModule,
  data,
  previewMode,
  busy,
  onStockIn,
  onAdjustment,
  onWriteOff,
  onCreateSupplier,
  onUpdateSupplier,
  onCreatePurchaseOrder,
  onReceivePurchaseOrder,
  onPurchaseOrderStatus,
  onSalesOrderStatus,
  theme,
  onModuleChange,
}) {
  if (roleKey === "User_Admin") {
    return (
      <UserAdminDashboardContent
        activeModule={activeModule}
        previewMode={previewMode}
        theme={theme}
        onModuleChange={onModuleChange}
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
        onWriteOff={onWriteOff}
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

export default function RoleDashboardContent(props) {
  const { roleKey, activeModule, data } = props;
  if (roleKey === "User_Admin") return <RoleModuleContent {...props} />;
  if (data?.live && activeModule === ROLE_WORKSPACES[roleKey]?.title) {
    return <RoleWorkspace key={roleKey} {...props} />;
  }
  return (
    <>
      {activeModule === "Overview" && (
        <RoleFunctionDirectory
          roleKey={roleKey}
          data={data}
          onModuleChange={props.onModuleChange}
        />
      )}
      <RoleModuleContent {...props} />
    </>
  );
}
