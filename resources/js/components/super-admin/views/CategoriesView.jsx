import React, { useMemo, useState } from "react";
import { number } from "../../../utils/super-admin/superAdminUtils.js";
import { apiRequest } from "../../../services/super-admin/superAdminApi.js";
import { EmptyTable } from "../common/AdminCommon.jsx";

function Categories({ data, openModal }) {
  const categories = data.categories || [];
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: "", description: "", is_active: true });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const filteredCategories = useMemo(() => {
    const needle = search.trim().toLowerCase();
    if (!needle) return categories;
    return categories.filter((item) =>
      [item.category, item.description, item.is_active ? "active" : "inactive"]
        .some((value) => String(value || "").toLowerCase().includes(needle))
    );
  }, [categories, search]);

  const openEditor = (category) => {
    setEditing(category);
    setError("");
    setForm({
      name: category.category || "",
      description: category.description || "",
      is_active: Boolean(category.is_active),
    });
  };

  const closeEditor = () => {
    if (busy) return;
    setEditing(null);
    setError("");
  };

  const saveCategory = async (event) => {
    event.preventDefault();
    if (!editing || busy) return;
    setBusy(true);
    setError("");

    try {
      await apiRequest(`/api/super-admin/categories/${editing.category_id}`, {
        method: "PUT",
        body: {
          name: form.name,
          description: form.description || null,
          is_active: Boolean(form.is_active),
        },
      });
      window.location.reload();
    } catch (requestError) {
      setError(requestError.message || "Unable to update category.");
      setBusy(false);
    }
  };

  return (
    <>
      <div className="section-head">
        <div><h2>Product Categories</h2><p>Manage product categories stored in WBO_Categories and used across the catalog.</p></div>
        <button className="btn-primary" type="button" onClick={() => openModal("categoryInfo")}>+ Add Category</button>
      </div>

      <div className="ops-panel user-filter-panel">
        <div className="user-search-wrap">
          <input className="user-search-input" type="search" value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search categories..." aria-label="Search categories" />
          {search && <button className="user-search-clear" type="button" onClick={() => setSearch("")}>Clear</button>}
        </div>
      </div>

      <div className="ops-panel"><div className="table-wrap"><table className="ops-table">
        <thead><tr><th>Category</th><th>Status</th><th>Products</th><th>Total Stock</th><th>Actions</th></tr></thead>
        <tbody>
          {filteredCategories.length === 0
            ? <EmptyTable colSpan={5} text="No categories match your search." />
            : filteredCategories.map((item) => <tr key={item.category_id}>
                <td>{item.category}</td><td>{item.is_active ? "ACTIVE" : "INACTIVE"}</td>
                <td>{number(item.product_count)}</td><td>{number(item.total_stock)}</td>
                <td><button className="row-action row-action-wide" type="button" onClick={() => openEditor(item)}>Edit</button></td>
              </tr>)}
        </tbody>
      </table></div></div>

      {editing && (
        <div className="admin-modal-backdrop" onClick={closeEditor}>
          <div className="admin-modal" role="dialog" aria-modal="true" aria-labelledby="edit-category-title"
            onClick={(event) => event.stopPropagation()}>
            <div className="admin-modal-header">
              <div><span className="admin-modal-eyebrow">Super Admin</span><h2 id="edit-category-title">Edit Category</h2></div>
              <button className="admin-modal-close" type="button" aria-label="Close" onClick={closeEditor} disabled={busy}>x</button>
            </div>

            <form className="admin-modal-body" onSubmit={saveCategory}>
              <div className="admin-form-row">
                <label>Category Name</label>
                <input value={form.name} maxLength={100} required
                  onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} />
              </div>

              <div className="admin-form-row">
                <label>Description</label>
                <textarea rows={4} value={form.description} maxLength={255}
                  onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} />
              </div>

              <div className="admin-form-row">
                <label>Status</label>
                <select value={form.is_active ? "ACTIVE" : "INACTIVE"}
                  onChange={(event) => setForm((current) => ({ ...current, is_active: event.target.value === "ACTIVE" }))}>
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="INACTIVE">INACTIVE</option>
                </select>
              </div>

              <p className="product-stock-edit-note">Inactive categories are preserved for existing product and history references.</p>
              {error && <p className="admin-form-error">{error}</p>}
              <button className="btn-primary" type="submit" disabled={busy}>
                {busy ? "Saving..." : "Save Category Changes"}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default Categories;