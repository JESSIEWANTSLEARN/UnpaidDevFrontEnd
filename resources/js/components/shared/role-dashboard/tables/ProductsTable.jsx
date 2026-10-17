import React, { useMemo, useState } from "react";
import Empty from "../common/Empty.jsx";
import { number } from "../utils/formatters.js";

export default function ProductsTable({
  products = [],
}) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [stockCondition, setStockCondition] = useState("all");

  const categories = useMemo(
    () => [...new Set(products.map((product) => product.category).filter(Boolean))].sort(),
    [products],
  );

  const filteredProducts = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return products.filter((product) => {
      const stock = Number(product.available_stock || 0);
      const reorderPoint = Number(product.reorder_point ?? 10);
      const condition = stock <= 0 ? "Out of stock" : stock <= reorderPoint ? "Low stock" : "In stock";
      const categoryMatches = category === "all" || product.category === category;
      const conditionMatches = stockCondition === "all" || condition === stockCondition;
      const searchMatches = !needle || [
        product.product_id,
        product.sku,
        product.name,
        product.category,
        product.supplier_name,
      ].some((value) =>
        String(value ?? "").toLowerCase().includes(needle)
      );
      return categoryMatches && conditionMatches && searchMatches;
    });
  }, [products, search, category, stockCondition]);

  if (!products.length) {
    return <Empty text="No products found." />;
  }

  return (
    <>
      <div className="role-live-filter-bar" role="search">
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
        <select
          className="role-live-filter-select"
          value={category}
          onChange={(event) => setCategory(event.target.value)}
          aria-label="Filter products by category"
        >
          <option value="all">All categories</option>
          {categories.map((value) => <option key={value} value={value}>{value}</option>)}
        </select>
        <select
          className="role-live-filter-select"
          value={stockCondition}
          onChange={(event) => setStockCondition(event.target.value)}
          aria-label="Filter products by stock condition"
        >
          <option value="all">All stock conditions</option>
          <option value="Out of stock">Out of stock</option>
          <option value="Low stock">Low stock</option>
          <option value="In stock">In stock</option>
        </select>
      </div>

      {filteredProducts.length === 0 ? (
        <Empty text="No products match your search and filters." />
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
