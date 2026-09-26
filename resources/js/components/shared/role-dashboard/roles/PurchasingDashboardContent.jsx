import React, { useState } from "react";
import {
  PurchaseOrderForm,
  SupplierForm,
} from "../../../purchasing/PurchasingActions.jsx";
import {
  ProductsTable,
  PurchaseOrdersTable,
  Section,
  SuppliersTable,
} from "../RoleDashboardPrimitives.jsx";
import FoundationOnlyContent from "./FoundationOnlyContent.jsx";
import RoleDashboardOverview from "./RoleDashboardOverview.jsx";

export default function PurchasingDashboardContent({
  roleKey,
  activeModule,
  data,
  previewMode,
  busy,
  onCreateSupplier,
  onUpdateSupplier,
  onCreatePurchaseOrder,
  onPurchaseOrderStatus,
}) {
  const [selectedSupplier, setSelectedSupplier] =
    useState(null);
  const overviewModule =
    roleKey === "Purchasing_Manager"
      ? "Purchasing Overview"
      : "Purchasing Tasks";

  if (
    activeModule === "Overview" ||
    activeModule === overviewModule
  ) {
    return (
      <RoleDashboardOverview
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
            roleKey === "Purchasing_Manager"
              ? "Maintain supplier contacts, lead times, and activation status."
              : "Maintain day-to-day supplier contact information. Supplier activation remains a manager decision."
          }
        >
          <SupplierForm
            roleKey={roleKey}
            previewMode={previewMode}
            busy={busy}
            selectedSupplier={selectedSupplier}
            onClearSelection={() => setSelectedSupplier(null)}
            onCreate={onCreateSupplier}
            onUpdate={onUpdateSupplier}
          />
        </Section>

        <Section
          title="Suppliers"
          description="Live supplier records and linked-product counts."
        >
          <SuppliersTable
            suppliers={data.suppliers}
            previewMode={previewMode}
            onEdit={setSelectedSupplier}
          />
        </Section>
      </>
    );
  }

  if (activeModule === "Purchase Orders") {
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
            onCreate={onCreatePurchaseOrder}
          />
        </Section>

        <Section
          title="Purchase Orders"
          description="Draft, approval, ordering, and receiving status."
        >
          <PurchaseOrdersTable
            purchaseOrders={data.purchase_orders}
            roleKey={roleKey}
            previewMode={previewMode}
            currentUserId={data.current_user_id}
            busy={busy}
            onStatus={onPurchaseOrderStatus}
          />
        </Section>
      </>
    );
  }

  if (
    activeModule === "Reorder Needs" ||
    activeModule === "Reorder Requests"
  ) {
    return (
      <Section
        title={activeModule}
        description="Products at or below their configured reorder point. Suggested PO quantity targets roughly twice the reorder point; Purchasing still reviews and creates the PO."
      >
        <ProductsTable products={data.reorder_needs} />
      </Section>
    );
  }

  if (
    roleKey === "Purchasing_Manager" &&
    activeModule === "Approvals"
  ) {
    return (
      <Section
        title="Purchase Order Approvals"
        description="Only Purchasing Manager can approve pending purchase orders."
      >
        <PurchaseOrdersTable
          purchaseOrders={data.purchase_orders}
          roleKey={roleKey}
          previewMode={previewMode}
          currentUserId={data.current_user_id}
          busy={busy}
          onStatus={onPurchaseOrderStatus}
          approvalsOnly
        />
      </Section>
    );
  }

  return (
    <FoundationOnlyContent
      activeModule={activeModule}
    />
  );
}
