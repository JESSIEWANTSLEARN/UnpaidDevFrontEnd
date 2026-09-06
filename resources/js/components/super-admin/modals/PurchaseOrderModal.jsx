import React from "react";
import { ErrorMessage, SubmitButton, submit } from "./FormHelpers.jsx";

export default function PurchaseOrderModal({
  busy,
  error,
  data,
  purchaseOrderForm,
  setPurchaseOrderForm,
  onAddPurchaseOrder,
}) {
  const suppliers = data?.suppliers || [];
  const products = data?.products || [];
  const update = (field) => (event) => setPurchaseOrderForm((form) => ({ ...form, [field]: event.target.value }));

  return (
    <form className="admin-modal-body" onSubmit={(event) => submit(event, busy, onAddPurchaseOrder)}>
      <div className="admin-form-row">
        <label>Supplier</label>
        <select value={purchaseOrderForm.supplier_id} required onChange={update("supplier_id")}>
          <option value="">Select supplier</option>
          {suppliers.map((supplier) => <option key={supplier.supplier_id} value={supplier.supplier_id}>{supplier.name}</option>)}
        </select>
      </div>
      <div className="admin-form-row">
        <label>Product</label>
        <select value={purchaseOrderForm.product_id} required onChange={update("product_id")}>
          <option value="">Select product</option>
          {products.map((product) => <option key={product.product_id} value={product.product_id}>{product.sku} — {product.name}</option>)}
        </select>
      </div>
      <div className="admin-form-row"><label>Quantity</label><input type="number" min="1" value={purchaseOrderForm.quantity} required onChange={update("quantity")} /></div>
      <div className="admin-form-row">
        <label>Status</label>
        <select value={purchaseOrderForm.status} onChange={update("status")}><option value="DRAFT">DRAFT</option><option value="ORDERED">ORDERED</option></select>
      </div>
      <ErrorMessage error={error} />
      <SubmitButton busy={busy} busyText="Creating...">+ New Purchase Order</SubmitButton>
    </form>
  );
}
