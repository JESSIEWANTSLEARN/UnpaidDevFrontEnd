import React from "react";
import {
  Alerts,
  BatchesTable,
  Metrics,
  OrdersTable,
  ProductsTable,
  PurchaseOrdersTable,
  Section,
} from "../RoleDashboardPrimitives.jsx";

export default function RoleDashboardOverview({
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
              purchaseOrders={data.purchase_orders}
              roleKey={roleKey}
              previewMode
              currentUserId={data.current_user_id}
              onStatus={() => {}}
            />
          </Section>

          <Section
            title="Recent Sales Activity"
            description="Latest customer-order activity without unnecessary customer profile data."
          >
            <OrdersTable orders={data.orders} />
          </Section>
        </>
      )}

      {roleKey === "Warehouse_Admin" && (
        <Section
          title="Recent Receiving & Batches"
          description="Newest batch-level inventory records."
        >
          <BatchesTable
            batches={(data.batches || []).slice(0, 12)}
          />
        </Section>
      )}

      {roleKey === "Inventory_Controller" && (
        <Section
          title="Inventory Health"
          description="Products at or below their configured reorder point require attention."
        >
          <ProductsTable
            products={data.low_stock_products}
          />
        </Section>
      )}

      {(roleKey === "Purchasing_Manager" ||
        roleKey === "Purchasing_Staff") && (
        <>
          <Section
            title="Reorder Needs"
            description="Products at or below their configured reorder point, with a suggested replenishment quantity."
          >
            <ProductsTable products={data.reorder_needs} />
          </Section>

          <Section
            title="Recent Purchase Orders"
            description="Latest procurement activity."
          >
            <PurchaseOrdersTable
              purchaseOrders={data.purchase_orders}
              roleKey={roleKey}
              previewMode
              currentUserId={data.current_user_id}
              onStatus={() => {}}
            />
          </Section>
        </>
      )}
    </>
  );
}
