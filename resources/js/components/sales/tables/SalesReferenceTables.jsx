import { SalesEmpty } from "../common/SalesDashboardPrimitives.jsx";
import {
  formatDate,
  formatMoney,
  formatNumber,
} from "../utils/salesFormatters.js";

export function SalesCustomersTable({ customers }) {
  if (!customers.length) {
    return (
      <SalesEmpty text="No System User customers found." />
    );
  }

  return (
    <div className="sales-role-table-wrap">
      <table className="sales-role-table">
        <thead>
          <tr>
            <th>Customer</th>
            <th>Contact</th>
            <th>Status</th>
            <th>Orders</th>
            <th>Fulfilled</th>
            <th>Total Spent</th>
            <th>Last Order</th>
          </tr>
        </thead>
        <tbody>
          {customers.map((customer) => (
            <tr key={customer.user_id}>
              <td>
                <strong>{customer.name}</strong>
                <small>{customer.email}</small>
              </td>
              <td>{customer.contact_number || "-"}</td>
              <td>{customer.account_status}</td>
              <td>{formatNumber(customer.order_count)}</td>
              <td>
                {formatNumber(customer.fulfilled_orders)}
              </td>
              <td>{formatMoney(customer.total_spent)}</td>
              <td>{formatDate(customer.last_order_at)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function SalesProductPerformanceTable({ rows }) {
  if (!rows.length) {
    return (
      <SalesEmpty text="No fulfilled sales yet." />
    );
  }

  return (
    <div className="sales-role-table-wrap">
      <table className="sales-role-table">
        <thead>
          <tr>
            <th>SKU</th>
            <th>Product</th>
            <th>Units Sold</th>
            <th>Orders</th>
            <th>Revenue</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.product_id}>
              <td>{row.sku}</td>
              <td>{row.name}</td>
              <td>{formatNumber(row.units_sold)}</td>
              <td>{formatNumber(row.order_count)}</td>
              <td>{formatMoney(row.revenue)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function SalesAvailabilityTable({
  products,
}) {
  if (!products.length) {
    return <SalesEmpty text="No products found." />;
  }

  return (
    <div className="sales-role-table-wrap">
      <table className="sales-role-table">
        <thead>
          <tr>
            <th>SKU</th>
            <th>Product</th>
            <th>Category</th>
            <th>Price</th>
            <th>Available</th>
            <th>Condition</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => {
            const stock = Number(
              product.available_stock || 0,
            );
            const reorderPoint = Number(
              product.reorder_point ?? 10,
            );

            const condition =
              stock <= 0
                ? "OUT"
                : stock <= reorderPoint
                  ? "LOW"
                  : "OK";

            return (
              <tr key={product.product_id}>
                <td>{product.sku}</td>
                <td>{product.name}</td>
                <td>{product.category}</td>
                <td>{formatMoney(product.unit_price)}</td>
                <td>{formatNumber(stock)}</td>
                <td>
                  <span
                    className={`sales-stock stock-${condition.toLowerCase()}`}
                  >
                    {condition}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
