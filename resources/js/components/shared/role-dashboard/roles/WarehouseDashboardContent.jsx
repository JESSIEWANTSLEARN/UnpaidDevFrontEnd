import React from "react";
import {
  PurchaseOrderReceivingForm,
  StockInForm,
} from "../../../inventory/InventoryActions.jsx";
import {
  Alerts,
  BatchesTable,
  PurchaseOrdersTable,
  Section,
  TransactionsTable,
} from "../RoleDashboardPrimitives.jsx";
import FoundationOnlyContent from "./FoundationOnlyContent.jsx";
import RoleDashboardOverview from "./RoleDashboardOverview.jsx";

export default function WarehouseDashboardContent({
  activeModule,
  data,
  previewMode,
  busy,
  onStockIn,
  onReceivePurchaseOrder,
}) {
  const roleKey = "Warehouse_Admin";

  if (
    activeModule === "Overview" ||
    activeModule === "Warehouse Overview"
  ) {
    return (
      <RoleDashboardOverview
        roleKey={roleKey}
        data={data}
      />
    );
  }

  if (activeModule === "Receiving") {
    return (
      <>
        <Section
          title="Receive Purchase Order"
          description="Receive ordered supplier deliveries. Inventory, transaction history, and PO receiving status update together."
        >
          <PurchaseOrderReceivingForm
            purchaseOrders={data.purchase_orders || []}
            previewMode={previewMode}
            busy={busy}
            onSubmit={onReceivePurchaseOrder}
          />
        </Section>

        <Section
          title="Manual Stock In"
          description="Use this only for stock that is not being received from a purchase order."
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
          description="Ordered and partially received purchase orders remain available for warehouse follow-up."
        >
          <PurchaseOrdersTable
            purchaseOrders={(data.purchase_orders || []).filter(
              (po) =>
                [
                  "ORDERED",
                  "PARTIALLY_RECEIVED",
                ].includes(po.status),
            )}
            roleKey={roleKey}
            previewMode
            currentUserId={data.current_user_id}
            onStatus={() => {}}
          />
        </Section>
      </>
    );
  }

  if (activeModule === "Batch Tracking") {
    return (
      <Section
        title="Batch Tracking"
        description="Batch quantities, received dates, and expiry dates."
      >
        <BatchesTable batches={data.batches} />
      </Section>
    );
  }

  if (activeModule === "Stock Movement") {
    return (
      <Section
        title="Stock Movement"
        description="Latest RECEIVE, SALE, RESERVE, ADJUSTMENT, and WRITE_OFF records."
      >
        <TransactionsTable
          transactions={data.transactions}
        />
      </Section>
    );
  }

  if (activeModule === "Warehouse Issues") {
    return (
      <Section
        title="Warehouse Issues"
        description="Low stock, out-of-stock, expiry, and open-order conditions."
      >
        <Alerts alerts={data.alerts} />
      </Section>
    );
  }

  return (
    <FoundationOnlyContent
      activeModule={activeModule}
    />
  );
}