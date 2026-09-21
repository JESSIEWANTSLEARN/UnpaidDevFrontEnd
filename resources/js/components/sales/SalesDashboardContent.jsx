import { useMemo } from "react";
import "../../../css/sales/sales-dashboard.css";
import {
  SalesAlerts,
  SalesEmpty,
  SalesMetrics,
  SalesSection,
} from "./common/SalesDashboardPrimitives.jsx";
import SalesOrdersTable from "./tables/SalesOrdersTable.jsx";
import {
  SalesAvailabilityTable,
  SalesCustomersTable,
  SalesProductPerformanceTable,
} from "./tables/SalesReferenceTables.jsx";

/* WBO_ROLE_SALES_CONTENT_V2 */

export default function SalesDashboardContent({
  roleKey,
  activeModule,
  data,
  previewMode,
  busy,
  onOrderStatus,
}) {
  const manager = roleKey === "Sales_Manager";

  const openOrders = useMemo(
    () =>
      (data.orders || []).filter(
        (order) =>
          order.status === "PENDING" ||
          order.status === "PROCESSING",
      ),
    [data.orders],
  );

  if (
    activeModule === "Overview" ||
    activeModule ===
      (manager ? "Sales Overview" : "Sales Tasks")
  ) {
    return (
      <>
        <SalesMetrics
          metrics={data.metrics}
          manager={manager}
        />

        <SalesSection
          title="Sales Alerts"
          description="Current order backlog and fulfillment risks."
        >
          <SalesAlerts alerts={data.alerts} />
        </SalesSection>

        <SalesSection
          title="Orders Requiring Action"
          description="Pending orders need review; processing orders already have inventory reserved."
        >
          <SalesOrdersTable
            orders={openOrders}
            previewMode={previewMode}
            busy={busy}
            onStatus={onOrderStatus}
          />
        </SalesSection>
      </>
    );
  }

  if (activeModule === "Orders") {
    return (
      <SalesSection
        title="Customer Orders"
        description="PENDING -> PROCESSING reserves inventory using FEFO. FULFILLED converts that reservation into the completed sale."
      >
        <SalesOrdersTable
          orders={data.orders || []}
          previewMode={previewMode}
          busy={busy}
          onStatus={onOrderStatus}
        />
      </SalesSection>
    );
  }

  if (activeModule === "Customers") {
    return (
      <SalesSection
        title="Customers"
        description="Customer contact and sales history are visible here; account administration remains with User Admin."
      >
        <SalesCustomersTable
          customers={data.customers || []}
        />
      </SalesSection>
    );
  }

  if (
    manager &&
    activeModule === "Product Performance"
  ) {
    return (
      <SalesSection
        title="Product Performance"
        description="Fulfilled-order units and revenue only."
      >
        <SalesProductPerformanceTable
          rows={data.product_performance || []}
        />
      </SalesSection>
    );
  }

  if (manager && activeModule === "Sales Alerts") {
    return (
      <SalesSection
        title="Sales Alerts"
        description="Order-processing exceptions and fulfillment stock risks."
      >
        <SalesAlerts alerts={data.alerts} />
      </SalesSection>
    );
  }

  if (
    !manager &&
    activeModule === "Product Availability"
  ) {
    return (
      <SalesSection
        title="Product Availability"
        description="Live available stock after any active sales reservations."
      >
        <SalesAvailabilityTable
          products={data.products || []}
          threshold={data.low_stock_threshold || 10}
        />
      </SalesSection>
    );
  }

  return (
    <SalesSection
      title={activeModule}
      description="No sales content is configured for this section."
    >
      <SalesEmpty text="Nothing to display." />
    </SalesSection>
  );
}
