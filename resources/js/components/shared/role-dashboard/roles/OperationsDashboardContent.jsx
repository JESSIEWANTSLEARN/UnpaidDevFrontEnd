import React from "react";
import {
  Alerts,
  Metrics,
  OrdersTable,
  ProductsTable,
  PurchaseOrdersTable,
  Section,
} from "../RoleDashboardPrimitives.jsx";
import FoundationOnlyContent from "./FoundationOnlyContent.jsx";
import RoleDashboardOverview from "./RoleDashboardOverview.jsx";

export default function OperationsDashboardContent({
  activeModule,
  data,
}) {
  const roleKey = "Operations_Manager";

  if (activeModule === "Overview") {
    return (
      <RoleDashboardOverview
        roleKey={roleKey}
        data={data}
      />
    );
  }

  if (activeModule === "Operational Overview") {
    return (
      <Metrics
        metrics={data.metrics}
        roleKey={roleKey}
      />
    );
  }

  if (activeModule === "Inventory Health") {
    return (
      <Section
        title="Inventory Health"
        description="Current available stock calculated from live batch quantities."
      >
        <ProductsTable products={data.products} />
      </Section>
    );
  }

  if (activeModule === "Purchase Activity") {
    return (
      <Section
        title="Purchase Activity"
        description="Recent purchase orders and receiving progress."
      >
        <PurchaseOrdersTable
          purchaseOrders={data.purchase_orders}
          roleKey={roleKey}
          previewMode
          currentUserId={data.current_user_id}
          onStatus={() => {}}
        />
      </Section>
    );
  }

  if (activeModule === "Sales Activity") {
    return (
      <Section
        title="Sales Activity"
        description="Recent customer orders and totals."
      >
        <OrdersTable orders={data.orders} />
      </Section>
    );
  }

  if (activeModule === "Operational Alerts") {
    return (
      <Section
        title="Operational Alerts"
        description="Current exceptions needing operational attention."
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
