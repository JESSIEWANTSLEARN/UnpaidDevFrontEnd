import React, {
  useState,
} from "react";
import {
  AdjustmentForm,
  StockInForm,
} from "../../inventory/InventoryActions.jsx";
import {
  PurchaseOrderForm,
  SupplierForm,
} from "../../purchasing/PurchasingActions.jsx";
import "../../../../css/shared/role-dashboard-data.css";
import SalesDashboardContent from "../../sales/SalesDashboardContent.jsx";
import UserAdminDashboardContent from "../../user-admin/UserAdminDashboardContent.jsx";

// Shared dashboard content for operations, purchasing, warehouse, and inventory roles.

import {
  Alerts,
  BatchesTable,
  Metrics,
  OrdersTable,
  ProductsTable,
  PurchaseOrdersTable,
  Section,
  SuppliersTable,
  TransactionsTable,
} from "./RoleDashboardPrimitives.jsx";

function Overview({
  roleKey,
  data,
}) {
  return (
    <>
      <Metrics
        metrics={data.metrics}
        roleKey={roleKey}
      />

      <Section
        title="Operational Alerts"
        description="Live conditions calculated from current inventory, purchase orders, sales orders, and expiry dates."
      >
        <Alerts alerts={data.alerts} />
      </Section>

      {roleKey === "Operations_Manager" && (
        <>
          <Section
            title="Recent Purchase Activity"
            description="Latest purchase-order activity."
          >
            <PurchaseOrdersTable
              purchaseOrders={
                data.purchase_orders
              }
              roleKey={roleKey}
              previewMode
              currentUserId={
                data.current_user_id
              }
              onStatus={() => {}}
            />
          </Section>

          <Section
            title="Recent Sales Activity"
            description="Latest customer-order activity without unnecessary customer profile data."
          >
            <OrdersTable
              orders={data.orders}
            />
          </Section>
        </>
      )}

      {roleKey === "Warehouse_Admin" && (
        <Section
          title="Recent Receiving & Batches"
          description="Newest batch-level inventory records."
        >
          <BatchesTable
            batches={(
              data.batches || []
            ).slice(0, 12)}
          />
        </Section>
      )}

      {roleKey ===
        "Inventory_Controller" && (
        <Section
          title="Inventory Health"
          description={`Products at or below ${data.low_stock_threshold} units require attention.`}
        >
          <ProductsTable
            products={
              data.low_stock_products
            }
          />
        </Section>
      )}

      {(roleKey === "Purchasing_Manager" ||
        roleKey === "Purchasing_Staff") && (
        <>
          <Section
            title="Reorder Needs"
            description={`Products at or below ${data.low_stock_threshold} available units.`}
          >
            <ProductsTable
              products={
                data.reorder_needs
              }
            />
          </Section>

          <Section
            title="Recent Purchase Orders"
            description="Latest procurement activity."
          >
            <PurchaseOrdersTable
              purchaseOrders={
                data.purchase_orders
              }
              roleKey={roleKey}
              previewMode
              currentUserId={
                data.current_user_id
              }
              onStatus={() => {}}
            />
          </Section>
        </>
      )}
    </>
  );
}

function FoundationOnly({
  activeModule,
}) {
  return (
    <section className="role-dashboard-module">
      <span>Role Foundation</span>
      <h2>{activeModule}</h2>
      <p>
        This role remains on the protected
        dashboard foundation. Its live business
        API is added in the next role batch.
      </p>
    </section>
  );
}

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
  onPurchaseOrderStatus,
  onSalesOrderStatus,
  theme,
}) {
  const [
    selectedSupplier,
    setSelectedSupplier,
  ] = useState(null);

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
      <FoundationOnly
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
        onOrderStatus={
          onSalesOrderStatus
        }
      />
    );
  }
  if (activeModule === "Overview") {
    return (
      <Overview
        roleKey={roleKey}
        data={data}
      />
    );
  }

  // Operations Manager
  if (roleKey === "Operations_Manager") {
    if (
      activeModule ===
      "Operational Overview"
    ) {
      return (
        <Metrics
          metrics={data.metrics}
          roleKey={roleKey}
        />
      );
    }

    if (
      activeModule ===
      "Inventory Health"
    ) {
      return (
        <Section
          title="Inventory Health"
          description="Current available stock calculated from live batch quantities."
        >
          <ProductsTable
            products={data.products}
          />
        </Section>
      );
    }

    if (
      activeModule ===
      "Purchase Activity"
    ) {
      return (
        <Section
          title="Purchase Activity"
          description="Recent purchase orders and receiving progress."
        >
          <PurchaseOrdersTable
            purchaseOrders={
              data.purchase_orders
            }
            roleKey={roleKey}
            previewMode
            currentUserId={
              data.current_user_id
            }
            onStatus={() => {}}
          />
        </Section>
      );
    }

    if (
      activeModule ===
      "Sales Activity"
    ) {
      return (
        <Section
          title="Sales Activity"
          description="Recent customer orders and totals."
        >
          <OrdersTable
            orders={data.orders}
          />
        </Section>
      );
    }

    if (
      activeModule ===
      "Operational Alerts"
    ) {
      return (
        <Section
          title="Operational Alerts"
          description="Current exceptions needing operational attention."
        >
          <Alerts alerts={data.alerts} />
        </Section>
      );
    }
  }

  // Warehouse Admin
  if (roleKey === "Warehouse_Admin") {
    if (
      activeModule ===
      "Warehouse Overview"
    ) {
      return (
        <Overview
          roleKey={roleKey}
          data={data}
        />
      );
    }

    if (activeModule === "Receiving") {
      return (
        <>
          <Section
            title="Receive Stock"
            description="Create a batch and preserve the receiving movement in WBO_Transactions."
          >
            <StockInForm
              products={data.products}
              previewMode={previewMode}
              busy={busy}
              onSubmit={onStockIn}
            />
          </Section>

          <Section
            title="Open Purchase Orders"
            description="Orders that may require receiving follow-up."
          >
            <PurchaseOrdersTable
              purchaseOrders={(
                data.purchase_orders || []
              ).filter((po) =>
                [
                  "APPROVED",
                  "ORDERED",
                  "PARTIALLY_RECEIVED",
                ].includes(po.status),
              )}
              roleKey={roleKey}
              previewMode
              currentUserId={
                data.current_user_id
              }
              onStatus={() => {}}
            />
          </Section>
        </>
      );
    }

    if (
      activeModule ===
      "Batch Tracking"
    ) {
      return (
        <Section
          title="Batch Tracking"
          description="Batch quantities, received dates, and expiry dates."
        >
          <BatchesTable
            batches={data.batches}
          />
        </Section>
      );
    }

    if (
      activeModule ===
      "Stock Movement"
    ) {
      return (
        <Section
          title="Stock Movement"
          description="Latest RECEIVE, SALE, RESERVE, ADJUSTMENT, and WRITE_OFF records."
        >
          <TransactionsTable
            transactions={
              data.transactions
            }
          />
        </Section>
      );
    }

    if (
      activeModule ===
      "Warehouse Issues"
    ) {
      return (
        <Section
          title="Warehouse Issues"
          description="Low stock, out-of-stock, expiry, and open-order conditions."
        >
          <Alerts alerts={data.alerts} />
        </Section>
      );
    }
  }

  // Inventory Controller
  if (
    roleKey === "Inventory_Controller"
  ) {
    if (
      activeModule ===
      "Inventory Overview"
    ) {
      return (
        <Overview
          roleKey={roleKey}
          data={data}
        />
      );
    }

    if (
      activeModule ===
      "Stock Movement"
    ) {
      return (
        <Section
          title="Stock Movement"
          description="Auditable inventory transaction history."
        >
          <TransactionsTable
            transactions={
              data.transactions
            }
          />
        </Section>
      );
    }

    if (activeModule === "Stock In") {
      return (
        <Section
          title="Stock In"
          description="Receive a new product batch. Preview mode cannot write data."
        >
          <StockInForm
            products={data.products}
            previewMode={previewMode}
            busy={busy}
            onSubmit={onStockIn}
          />
        </Section>
      );
    }

    if (
      activeModule === "Adjustments"
    ) {
      return (
        <>
          <Section
            title="Inventory Adjustment"
            description="Correct a batch quantity while preserving an ADJUSTMENT transaction and audit record."
          >
            <AdjustmentForm
              batches={data.batches}
              previewMode={previewMode}
              busy={busy}
              onSubmit={
                onAdjustment
              }
            />
          </Section>

          <Section
            title="Recent Adjustments"
            description="Latest recorded inventory corrections."
          >
            <TransactionsTable
              transactions={(
                data.transactions || []
              ).filter(
                (transaction) =>
                  transaction.transaction_type ===
                  "ADJUSTMENT",
              )}
            />
          </Section>
        </>
      );
    }

    if (activeModule === "Low Stock") {
      return (
        <Section
          title="Low Stock"
          description={`Products with 1-${data.low_stock_threshold} units available.`}
        >
          <ProductsTable
            products={
              data.low_stock_products
            }
          />
        </Section>
      );
    }
  }

  // Purchasing Manager + Purchasing Staff
  const purchasingRole =
    roleKey === "Purchasing_Manager" ||
    roleKey === "Purchasing_Staff";

  if (purchasingRole) {
    const overviewModule =
      roleKey === "Purchasing_Manager"
        ? "Purchasing Overview"
        : "Purchasing Tasks";

    if (activeModule === overviewModule) {
      return (
        <Overview
          roleKey={roleKey}
          data={data}
        />
      );
    }

    if (activeModule === "Suppliers") {
      return (
        <>
          <Section
            title={
              selectedSupplier
                ? `Edit ${selectedSupplier.name}`
                : "Add Supplier"
            }
            description={
              roleKey ===
              "Purchasing_Manager"
                ? "Maintain supplier contacts, lead times, and activation status."
                : "Maintain day-to-day supplier contact information. Supplier activation remains a manager decision."
            }
          >
            <SupplierForm
              roleKey={roleKey}
              previewMode={previewMode}
              busy={busy}
              selectedSupplier={
                selectedSupplier
              }
              onClearSelection={() =>
                setSelectedSupplier(
                  null,
                )
              }
              onCreate={
                onCreateSupplier
              }
              onUpdate={
                onUpdateSupplier
              }
            />
          </Section>

          <Section
            title="Suppliers"
            description="Live supplier records and linked-product counts."
          >
            <SuppliersTable
              suppliers={data.suppliers}
              previewMode={previewMode}
              onEdit={
                setSelectedSupplier
              }
            />
          </Section>
        </>
      );
    }

    if (
      activeModule ===
      "Purchase Orders"
    ) {
      return (
        <>
          <Section
            title="Prepare Purchase Order"
            description="Create a draft or submit directly for Purchasing Manager approval."
          >
            <PurchaseOrderForm
              suppliers={data.suppliers}
              products={data.products}
              previewMode={previewMode}
              busy={busy}
              onCreate={
                onCreatePurchaseOrder
              }
            />
          </Section>

          <Section
            title="Purchase Orders"
            description="Draft, approval, ordering, and receiving status."
          >
            <PurchaseOrdersTable
              purchaseOrders={
                data.purchase_orders
              }
              roleKey={roleKey}
              previewMode={previewMode}
              currentUserId={
                data.current_user_id
              }
              busy={busy}
              onStatus={
                onPurchaseOrderStatus
              }
            />
          </Section>
        </>
      );
    }

    if (
      activeModule === "Reorder Needs" ||
      activeModule ===
        "Reorder Requests"
    ) {
      return (
        <Section
          title={
            activeModule
          }
          description={`These are live stock conditions, not fake request records. Products at or below ${data.low_stock_threshold} units can be turned into a purchase order from the Purchase Orders page.`}
        >
          <ProductsTable
            products={
              data.reorder_needs
            }
          />
        </Section>
      );
    }

    if (
      roleKey ===
        "Purchasing_Manager" &&
      activeModule === "Approvals"
    ) {
      return (
        <Section
          title="Purchase Order Approvals"
          description="Only Purchasing Manager can approve pending purchase orders."
        >
          <PurchaseOrdersTable
            purchaseOrders={
              data.purchase_orders
            }
            roleKey={roleKey}
            previewMode={previewMode}
            currentUserId={
              data.current_user_id
            }
            busy={busy}
            onStatus={
              onPurchaseOrderStatus
            }
            approvalsOnly
          />
        </Section>
      );
    }
  }

  return (
    <FoundationOnly
      activeModule={activeModule}
    />
  );
}