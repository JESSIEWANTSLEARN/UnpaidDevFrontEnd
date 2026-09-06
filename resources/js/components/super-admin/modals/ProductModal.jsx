import React from "react";
import { ErrorMessage, SubmitButton, submit } from "./FormHelpers.jsx";

export default function ProductModal({
  busy,
  error,
  data,
  productForm,
  setProductForm,
  onAddProduct,
}) {
  const suppliers = data?.suppliers || [];
  const update = (field) => (event) =>
    setProductForm((form) => ({ ...form, [field]: event.target.value }));
  const toggle = (field) => (event) =>
    setProductForm((form) => ({ ...form, [field]: event.target.checked }));

  return (
    <form className="admin-modal-body" onSubmit={(event) => submit(event, busy, onAddProduct)}>
      <div className="admin-form-row"><label>SKU</label><input value={productForm.sku} maxLength={50} required onChange={update("sku")} /></div>
      <div className="admin-form-row"><label>Product Name</label><input value={productForm.name} maxLength={150} required onChange={update("name")} /></div>
      <div className="admin-form-row"><label>Description</label><textarea value={productForm.description} rows={3} onChange={update("description")} /></div>
      <div className="admin-form-row">
        <label>Category</label>
        <select
          value={productForm.category_id || ""}
          required
          onChange={(event) =>
            setProductForm((form) => ({
              ...form,
              category_id: event.target.value,
              category: "",
            }))
          }
        >
          <option value="">Select category</option>
          {(data?.categories || [])
            .filter((category) => Number(category.is_active ?? 1) === 1)
            .map((category) => (
              <option key={category.category_id} value={category.category_id}>
                {category.category}
              </option>
            ))}
        </select>
      </div>
      <div className="admin-form-row">
        <label>Supplier</label>
        <select value={productForm.supplier_id} onChange={update("supplier_id")}>
          <option value="">No supplier</option>
          {suppliers.map((supplier) => <option key={supplier.supplier_id} value={supplier.supplier_id}>{supplier.name}</option>)}
        </select>
      </div>
      <div className="admin-form-row">
        <label>ABC Class</label>
        <select value={productForm.abc_class} onChange={update("abc_class")}>
          <option value="A">A</option><option value="B">B</option><option value="C">C</option>
        </select>
      </div>
      <div className="admin-form-grid">
        <div className="admin-form-row"><label>Unit Cost</label><input type="number" min="0" step="0.01" value={productForm.unit_cost} required onChange={update("unit_cost")} /></div>
        <div className="admin-form-row"><label>Unit Price</label><input type="number" min="0" step="0.01" value={productForm.unit_price} required onChange={update("unit_price")} /></div>
      </div>
      <div className="admin-form-checks">
        <label><input type="checkbox" checked={productForm.is_seasonal} onChange={toggle("is_seasonal")} /> Seasonal</label>
        <label><input type="checkbox" checked={productForm.is_visible} onChange={toggle("is_visible")} /> Visible</label>
        <label><input type="checkbox" checked={productForm.is_featured} onChange={toggle("is_featured")} /> Featured</label>
      </div>
      <div className="admin-form-row">
        <label>Primary Product Image (optional)</label>
        <input type="file" accept="image/png,image/jpeg,image/webp" onChange={(event) => setProductForm((form) => ({ ...form, image: event.target.files?.[0] || null }))} />
      </div>
      <ErrorMessage error={error} />
      <SubmitButton busy={busy} busyText="Adding...">+ Add Product</SubmitButton>
    </form>
  );
}
