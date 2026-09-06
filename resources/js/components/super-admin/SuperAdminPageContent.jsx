import React from "react";
import { LoadingState, ErrorState, EmptyState } from "./common/AdminCommon.jsx";
import DashboardView from "./views/DashboardView.jsx";
import ProductsView from "./views/ProductsView.jsx";
import ProductReviewsView from "./views/ProductReviewsView.jsx";
import InventoryView from "./views/InventoryView.jsx";
import CategoriesView from "./views/CategoriesView.jsx";
import SalesOrdersView from "./views/SalesOrdersView.jsx";
import SuppliersView from "./views/SuppliersView.jsx";
import StockMovementView from "./views/StockMovementView.jsx";
import PurchaseOrdersView from "./views/PurchaseOrdersView.jsx";
import UsersView from "./views/UsersView.jsx";
import ReportsView from "./views/ReportsView.jsx";
import AuditLogsView from "./views/AuditLogsView.jsx";
import SettingsView from "./views/SettingsView.jsx";
import SystemHealthView from "./views/SystemHealthView.jsx";
import RolePreviewView from "./views/RolePreviewView.jsx";

const PAGE_COMPONENTS = {
  Dashboard: DashboardView,
  Products: ProductsView,
  "Product Reviews": ProductReviewsView,
  Inventory: InventoryView,
  Categories: CategoriesView,
  "Sales Orders": SalesOrdersView,
  Suppliers: SuppliersView,
  "Stock Movement": StockMovementView,
  "Purchase Orders": PurchaseOrdersView,
  Users: UsersView,
  "View as Role": RolePreviewView,
  Reports: ReportsView,
  "Audit Logs": AuditLogsView,
  "System Health": SystemHealthView,
  Settings: SettingsView,
};

export default function SuperAdminPageContent({ activeMenu, loading, error, onRetry, ...props }) {
  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} onRetry={onRetry} />;
  if (!props.data) return <EmptyState text="No dashboard data was returned." />;

  const View = PAGE_COMPONENTS[activeMenu] || DashboardView;
  return <View {...props} />;
}
