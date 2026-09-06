import React, { useState } from "react";
import { money, number } from "../../../utils/super-admin/superAdminUtils.js";
import { apiRequest, toFormData } from "../../../services/super-admin/superAdminApi.js";
import { EmptyTable, ProductName } from "../common/AdminCommon.jsx";

const emptyEditForm = {
  product_id: "",
  sku: "",
  name: "",
  description: "",
  category_id: "",
  supplier_id: "",
  abc_class: "C",
  is_seasonal: false,
  is_visible: true,
  is_featured: false,
  unit_cost: "",
  unit_price: "",
  image: null,
};

function Products({ data, openModal }) {
  const products = data.products || [];
  const [editing, setEditing] = useState(null);
  const [editForm, setEditForm] = useState(emptyEditForm);
  const [editBusy, setEditBusy] = useState(false);
  const [editError, setEditError] = useState("");

  const openEditor = (product) => {
    const categoryId =
      (data.categories || []).find(
        (category) => category.category === product.category
      )?.category_id || "";

    setEditing(product);
    setEditError("");
    setEditForm({
      product_id: product.product_id,
      sku: product.sku || "",
      name: product.name || "",
      description: product.description || "",
      category_id: categoryId,
      supplier_id: product.supplier_id || "",
      abc_class: product.abc_class || "C",
      is_seasonal: Boolean(product.is_seasonal),
      is_visible: Boolean(product.is_visible),
      is_featured: Boolean(product.is_featured),
      unit_cost: product.unit_cost ?? "",
      unit_price: product.unit_price ?? "",
      image: null,
    });
  };

  const closeEditor = () => {
    if (editBusy) return;
    setEditing(null);
    setEditError("");
    setEditForm(emptyEditForm);
  };

  const update = (field) => (event) =>
    setEditForm((form) => ({
      ...form,
      [field]: event.target.value,
    }));

  const toggle = (field) => (event) =>
    setEditForm((form) => ({
      ...form,
      [field]: event.target.checked,
    }));

  const saveProduct = async (event) => {
    event.preventDefault();
    if (editBusy || !editing) return;

    setEditBusy(true);
    setEditError("");

    try {
      const body = toFormData(
        { ...editForm, _method: "PUT" },
        ["is_seasonal", "is_visible", "is_featured"]
      );

      await apiRequest(
        `/api/super-admin/products/${editing.product_id}`,
        {
          method: "POST",
          body,
          formData: true,
        }
      );

      // Laravel receives the intended update method through method spoofing.
      window.location.reload();
    } catch (error) {
      setEditError(error.message || "Unable to update the product.");
      setEditBusy(false);
    }
  };

  return (
    <>
      <div className="section-head">
        <div>
          <h2>Products</h2>
          <p>Manage catalog text, pricing, visibility, featured status, and product images.</p>
        </div>

        <div className="product-page-actions">
          <button
            className="btn-ghost"
            type="button"
            onClick={() => window.open("/store-preview", "_blank", "noopener,noreferrer")}
          >
            Preview Customer Store
          </button>
          <button
            className="btn-primary"
            type="button"
            onClick={() => openModal("addProduct")}
          >
            + Add Product
          </button>
        </div>
      </div>

      <div className="ops-panel">
        <div className="table-wrap">
          <table className="ops-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>SKU</th>
                <th>Category</th>
                <th>ABC</th>
                <th>Cost</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Visible</th>
                <th>Featured</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <EmptyTable colSpan={10} text="No products found." />
              ) : (
                products.map((product) => (
                  <tr key={product.product_id}>
                    <td><ProductName product={product} /></td>
                    <td>{product.sku}</td>
                    <td>{product.category}</td>
                    <td>{product.abc_class}</td>
                    <td>{money(product.unit_cost)}</td>
                    <td>{money(product.unit_price)}</td>
                    <td>{number(product.available_stock)}</td>
                    <td>{product.is_visible ? "Yes" : "No"}</td>
                    <td>{product.is_featured ? "Yes" : "No"}</td>
                    <td>
                      <button
                        className="row-action row-action-wide"
                        type="button"
                        onClick={() => openEditor(product)}
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {editing && (
        <div className="admin-modal-backdrop" onClick={closeEditor}>
          <div
            className="admin-modal admin-modal-wide"
            role="dialog"
            aria-modal="true"
            aria-labelledby="edit-product-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="admin-modal-header">
              <div>
                <span className="admin-modal-eyebrow">Super Admin</span>
                <h2 id="edit-product-title">Edit Product</h2>
              </div>
              <button
                className="admin-modal-close"
                type="button"
                aria-label="Close"
                onClick={closeEditor}
                disabled={editBusy}
              >
                x
              </button>
            </div>

            <form className="admin-modal-body" onSubmit={saveProduct}>
              <div className="product-edit-preview">
                {editing.image_url ? (
                  <img src={editing.image_url} alt={editing.name} />
                ) : (
                  <div className="product-edit-image-empty">No image</div>
                )}
                <div>
                  <strong>{editing.name}</strong>
                  <span>Current image</span>
                  <small>Uploading a new image replaces the current primary image.</small>
                </div>
              </div>

              <div className="admin-form-grid">
                <div className="admin-form-row">
                  <label>SKU</label>
                  <input
                    value={editForm.sku}
                    maxLength={50}
                    required
                    onChange={update("sku")}
                  />
                </div>

                <div className="admin-form-row">
                  <label>Product Name</label>
                  <input
                    value={editForm.name}
                    maxLength={150}
                    required
                    onChange={update("name")}
                  />
                </div>
              </div>

              <div className="admin-form-row">
                <label>Description</label>
                <textarea
                  value={editForm.description}
                  rows={4}
                  onChange={update("description")}
                />
              </div>

              <div className="admin-form-grid">
                <div className="admin-form-row">
                  <label>Category</label>
                  <select
                    value={editForm.category_id}
                    required
                    onChange={update("category_id")}
                  >
                    <option value="">Select category</option>
                    {(data.categories || [])
                      .filter((category) => Number(category.is_active ?? 1) === 1)
                      .map((category) => (
                        <option
                          key={category.category_id}
                          value={category.category_id}
                        >
                          {category.category}
                        </option>
                      ))}
                  </select>
                </div>

                <div className="admin-form-row">
                  <label>Supplier</label>
                  <select
                    value={editForm.supplier_id}
                    onChange={update("supplier_id")}
                  >
                    <option value="">No supplier</option>
                    {(data.suppliers || []).map((supplier) => (
                      <option
                        key={supplier.supplier_id}
                        value={supplier.supplier_id}
                      >
                        {supplier.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="admin-form-grid">
                <div className="admin-form-row">
                  <label>ABC Class</label>
                  <select
                    value={editForm.abc_class}
                    onChange={update("abc_class")}
                  >
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="C">C</option>
                  </select>
                </div>

                <div className="admin-form-row">
                  <label>New Product Image (optional)</label>
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={(event) =>
                      setEditForm((form) => ({
                        ...form,
                        image: event.target.files?.[0] || null,
                      }))
                    }
                  />
                </div>
              </div>

              <div className="admin-form-grid">
                <div className="admin-form-row">
                  <label>Unit Cost</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={editForm.unit_cost}
                    required
                    onChange={update("unit_cost")}
                  />
                </div>

                <div className="admin-form-row">
                  <label>Selling Price</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={editForm.unit_price}
                    required
                    onChange={update("unit_price")}
                  />
                </div>
              </div>

              <div className="admin-form-checks">
                <label>
                  <input
                    type="checkbox"
                    checked={editForm.is_seasonal}
                    onChange={toggle("is_seasonal")}
                  />
                  Seasonal
                </label>
                <label>
                  <input
                    type="checkbox"
                    checked={editForm.is_visible}
                    onChange={toggle("is_visible")}
                  />
                  Visible
                </label>
                <label>
                  <input
                    type="checkbox"
                    checked={editForm.is_featured}
                    onChange={toggle("is_featured")}
                  />
                  Featured
                </label>
              </div>

              <div className="product-stock-edit-note">
                Stock quantity is intentionally not editable here. Use Stock In / Inventory so stock history remains auditable.
              </div>

              {editError && (
                <p className="admin-form-error">{editError}</p>
              )}

              <button
                className="btn-primary"
                type="submit"
                disabled={editBusy}
              >
                {editBusy ? "Saving..." : "Save Product Changes"}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default Products;
