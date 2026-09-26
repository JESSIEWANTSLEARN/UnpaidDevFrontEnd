import React, { useMemo, useState } from "react";
import { number } from "../../../utils/super-admin/superAdminUtils.js";
import { apiRequest } from "../../../services/super-admin/superAdminApi.js";
import { EmptyTable } from "../common/AdminCommon.jsx";

function Suppliers({ data, openModal }) {
  const suppliers = data.suppliers || [];
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    name: "", contact_number: "", email: "", address: "",
    lead_time_days: "7", supplier_status: "ACTIVE",
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const filteredSuppliers = useMemo(() => {
    const needle = search.trim().toLowerCase();
    if (!needle) return suppliers;
    return suppliers.filter((supplier) =>
      [supplier.name, supplier.contact_number, supplier.email, supplier.address, supplier.supplier_status]
        .some((value) => String(value || "").toLowerCase().includes(needle))
    );
  }, [suppliers, search]);

  const openEditor = (supplier) => {
    setEditing(supplier);
    setError("");
    setForm({
      name: supplier.name || "",
      contact_number: supplier.contact_number || "",
      email: supplier.email || "",
      address: supplier.address || "",
      lead_time_days: String(supplier.lead_time_days ?? 7),
      supplier_status: supplier.supplier_status || "ACTIVE",
    });
  };

  const closeEditor = () => {
    if (busy) return;
    setEditing(null);
    setError("");
  };

  const update = (field) => (event) =>
    setForm((current) => ({ ...current, [field]: event.target.value }));

  const saveSupplier = async (event) => {
    event.preventDefault();
    if (!editing || busy) return;
    setBusy(true);
    setError("");

    try {
      await apiRequest(`/api/super-admin/suppliers/${editing.supplier_id}`, {
        method: "PUT",
        body: {
          name: form.name,
          contact_number: form.contact_number || null,
          email: form.email || null,
          address: form.address || null,
          lead_time_days: Number(form.lead_time_days),
          supplier_status: form.supplier_status,
        },
      });
      window.location.reload();
    } catch (requestError) {
      setError(requestError.message || "Unable to update supplier.");
      setBusy(false);
    }
  };

  return (
    <>
      <div className="section-head">
        <div><h2>Suppliers</h2><p>Live supplier records and product counts.</p></div>
        <button className="btn-primary" type="button" onClick={() => openModal("addSupplier")}>+ Add Supplier</button>
      </div>

      <div className="ops-panel user-filter-panel">
        <div className="user-search-wrap">
          <input className="user-search-input" type="search" value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search suppliers, email, contact, status..." aria-label="Search suppliers" />
          {search && <button className="user-search-clear" type="button" onClick={() => setSearch("")}>Clear</button>}
        </div>
      </div>

      <div className="ops-panel"><div className="table-wrap"><table className="ops-table">
        <thead><tr><th>Supplier</th><th>Status</th><th>Contact</th><th>Email</th><th>Lead Time</th><th>Products</th><th>Actions</th></tr></thead>
        <tbody>
          {filteredSuppliers.length === 0
            ? <EmptyTable colSpan={7} text="No suppliers match your search." />
            : filteredSuppliers.map((supplier) => <tr key={supplier.supplier_id}>
                <td>{supplier.name}</td><td>{supplier.supplier_status}</td><td>{supplier.contact_number || "-"}</td>
                <td>{supplier.email || "-"}</td><td>{number(supplier.lead_time_days)} day(s)</td>
                <td>{number(supplier.product_count)}</td>
                <td><button className="row-action row-action-wide" type="button" onClick={() => openEditor(supplier)}>Edit</button></td>
              </tr>)}
        </tbody>
      </table></div></div>

      {editing && (
        <div className="admin-modal-backdrop" onClick={closeEditor}>
          <div className="admin-modal admin-modal-wide" role="dialog" aria-modal="true" aria-labelledby="edit-supplier-title"
            onClick={(event) => event.stopPropagation()}>
            <div className="admin-modal-header">
              <div><span className="admin-modal-eyebrow">Super Admin</span><h2 id="edit-supplier-title">Edit Supplier</h2></div>
              <button className="admin-modal-close" type="button" aria-label="Close" onClick={closeEditor} disabled={busy}>x</button>
            </div>

            <form className="admin-modal-body" onSubmit={saveSupplier}>
              <div className="admin-form-grid">
                <div className="admin-form-row"><label>Supplier Name</label>
                  <input value={form.name} maxLength={150} required onChange={update("name")} /></div>
                <div className="admin-form-row"><label>Contact Number</label>
                  <input value={form.contact_number} maxLength={20} onChange={update("contact_number")} /></div>
              </div>

              <div className="admin-form-grid">
                <div className="admin-form-row"><label>Email</label>
                  <input type="email" value={form.email} maxLength={100} onChange={update("email")} /></div>
                <div className="admin-form-row"><label>Lead Time (days)</label>
                  <input type="number" min="0" value={form.lead_time_days} required onChange={update("lead_time_days")} /></div>
              </div>

              <div className="admin-form-row"><label>Address</label>
                <input value={form.address} maxLength={255} onChange={update("address")} /></div>

              <div className="admin-form-row"><label>Status</label>
                <select value={form.supplier_status} onChange={update("supplier_status")}>
                  <option value="ACTIVE">ACTIVE</option><option value="INACTIVE">INACTIVE</option>
                </select>
              </div>

              <p className="product-stock-edit-note">Inactive suppliers are preserved for product and purchase-order history.</p>
              {error && <p className="admin-form-error">{error}</p>}
              <button className="btn-primary" type="submit" disabled={busy}>
                {busy ? "Saving..." : "Save Supplier Changes"}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default Suppliers;