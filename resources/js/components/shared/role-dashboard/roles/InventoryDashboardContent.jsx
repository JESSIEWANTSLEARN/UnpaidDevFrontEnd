import React from "react";
import {
  AdjustmentForm,
  StockInForm,
} from "../../../inventory/InventoryActions.jsx";
import {
  ProductsTable,
  Section,
  TransactionsTable,
} from "../RoleDashboardPrimitives.jsx";
import FoundationOnlyContent from "./FoundationOnlyContent.jsx";
import RoleDashboardOverview from "./RoleDashboardOverview.jsx";

export default function InventoryDashboardContent({
  activeModule,
  data,
  previewMode,
  busy,
  onStockIn,
  onAdjustment,
}) {
  const roleKey = "Inventory_Controller";

  if (
    activeModule === "Overview" ||
    activeModule === "Inventory Overview"
  ) {
    return (
      <RoleDashboardOverview
        roleKey={roleKey}
        data={data}
      />
    );
  }

  if (activeModule === "Stock Movement") {
    return (
      <Section
        title="Stock Movement"
        description="Auditable inventory transaction history."
      >
        <TransactionsTable
          transactions={data.transactions}
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

  if (activeModule === "Adjustments") {
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
            onSubmit={onAdjustment}
          />
        </Section>

        <Section
          title="Recent Adjustments"
          description="Latest recorded inventory corrections."
        >
          <TransactionsTable
            transactions={(data.transactions || []).filter(
              (transaction) =>
                transaction.transaction_type === "ADJUSTMENT",
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
          products={data.low_stock_products}
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
