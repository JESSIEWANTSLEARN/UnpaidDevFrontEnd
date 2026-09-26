import React, { useMemo, useState } from "react";
import Empty from "../common/Empty.jsx";
import { number } from "../utils/formatters.js";

export default function ProductsTable({
  products = [],
}) {
  const [search, setSearch] = useState("");

  const filteredProducts = useMemo(() => {
    const needle = search.trim().toLowerCase();

    if (!needle) return products;

    return products.filter((product) =>
      [
        product.product_id,
        product.sku,
        product.name,
        product.category,
        product.supplier_name,
      ].some((value) =>
        String(value ?? "").toLowerCase().includes(needle)
      )
    );
  }, [products, search]);

  if (!products.length) {
    return <Empty text="No products found." />;
  }

  return (
    <>
      <div className="role-live-filter-bar">
        <div className="role-live-search-wrap">
          <input
            className="role-live-search-input"
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search product, SKU, category, supplier..."
            aria-label="Search products"
          />
          {search && (
            <button
              className="role-live-search-clear"
              type="button"
              onClick={() => setSearch("")}
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {filteredProducts.length === 0 ? (
        <Empty text="No products match your search." />
      ) : (
        <div className="role-live-table-wrap">
          <table className="role-live-table">
            <thead>
              <tr>
                <th>SKU</th>
                <th>Product</th>
                <th>Category</th>
                <th>Supplier</th>
                <th>Available</th>
                <th>Reorder Point</th>
                <th>Suggested PO Qty</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => (
                <tr key={product.product_id}>
                  <td>{product.sku}</td>
                  <td>{product.name}</td>
                  <td>{product.category}</td>
                  <td>{product.supplier_name || "-"}</td>
                  <td>{number(product.available_stock)}</td>
                  <td>{number(product.reorder_point)}</td>
                  <td>
                    {number(
                      product.recommended_reorder_quantity,
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}