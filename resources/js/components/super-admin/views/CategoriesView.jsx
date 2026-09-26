import React, { useMemo, useState } from "react";
import { number } from "../../../utils/super-admin/superAdminUtils.js";
import { EmptyTable } from "../common/AdminCommon.jsx";

function Categories({ data, openModal }) {
  const categories = data.categories || [];
  const [search, setSearch] = useState("");

  const filteredCategories = useMemo(() => {
    const needle = search.trim().toLowerCase();

    if (!needle) {
      return categories;
    }

    return categories.filter((item) =>
      String(item.category || "")
        .toLowerCase()
        .includes(needle),
    );
  }, [categories, search]);

  return (
    <>
      <div className="section-head">
        <div>
          <h2>Product Categories</h2>
          <p>
            Manage product categories stored in WBO_Categories and used across
            the catalog.
          </p>
        </div>

        <button
          className="btn-primary"
          type="button"
          onClick={() => openModal("categoryInfo")}
        >
          + Add Category
        </button>
      </div>

      <div className="ops-panel user-filter-panel">
        <div className="user-search-wrap">
          <input
            className="user-search-input"
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search categories..."
            aria-label="Search categories"
          />

          {search && (
            <button
              className="user-search-clear"
              type="button"
              onClick={() => setSearch("")}
            >
              Clear
            </button>
          )}
        </div>
      </div>

      <div className="ops-panel">
        <div className="table-wrap">
          <table className="ops-table">
            <thead>
              <tr>
                <th>Category</th>
                <th>Products</th>
                <th>Total Stock</th>
              </tr>
            </thead>

            <tbody>
              {filteredCategories.length === 0 ? (
                <EmptyTable
                  colSpan={3}
                  text="No categories match your search."
                />
              ) : (
                filteredCategories.map((item) => (
                  <tr key={item.category}>
                    <td>{item.category}</td>
                    <td>{number(item.product_count)}</td>
                    <td>{number(item.total_stock)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

export default Categories;
