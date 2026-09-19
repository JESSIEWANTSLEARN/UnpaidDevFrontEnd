import React from "react";
import Empty from "../common/Empty.jsx";
import { number } from "../utils/formatters.js";

export default function ProductsTable({
  products = [],
}) {
  if (!products.length) {
    return <Empty text="No products found." />;
  }

  return (
    <div className="role-live-table-wrap">
      <table className="role-live-table">
        <thead>
          <tr>
            <th>SKU</th>
            <th>Product</th>
            <th>Category</th>
            <th>Supplier</th>
            <th>Available</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.product_id}>
              <td>{product.sku}</td>
              <td>{product.name}</td>
              <td>{product.category}</td>
              <td>
                {product.supplier_name || "-"}
              </td>
              <td>
                {number(product.available_stock)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
