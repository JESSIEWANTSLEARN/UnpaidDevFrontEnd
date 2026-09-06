import React from "react";
import { ErrorMessage, SubmitButton, submit } from "./FormHelpers.jsx";

export default function StockInModal({ busy, error, data, stockForm, setStockForm, onStockIn }) {
  const products = data?.products || [];
  const update = (field) => (event) => setStockForm((form) => ({ ...form, [field]: event.target.value }));

  return (
    <form className="admin-modal-body" onSubmit={(event) => submit(event, busy, onStockIn)}>
      <div className="admin-form-row">
        <label>Product</label>
        <select value={stockForm.product_id} required onChange={update("product_id")}>
          <option value="">Select product</option>
          {products.map((product) => <option key={product.product_id} value={product.product_id}>{product.sku} — {product.name}</option>)}
        </select>
      </div>
      <div className="admin-form-row"><label>Batch Number</label><input value={stockForm.batch_number} maxLength={50} required onChange={update("batch_number")} /></div>
      <div className="admin-form-row"><label>Quantity Received</label><input type="number" min="1" value={stockForm.quantity_received} required onChange={update("quantity_received")} /></div>
      <div className="admin-form-row"><label>Expiry Date (optional)</label><input type="date" value={stockForm.expiry_date} onChange={update("expiry_date")} /></div>
      <ErrorMessage error={error} />
      <SubmitButton busy={busy} busyText="Saving...">+ Stock In</SubmitButton>
    </form>
  );
}
