import React, { useMemo, useState } from "react";
import { number, formatDate, poStatusClass } from "../../../utils/super-admin/superAdminUtils.js";
import { EmptyTable } from "../common/AdminCommon.jsx";

function PurchaseOrders({ data, openModal }) {
  const purchaseOrders = data.purchase_orders || [];
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");

  const statuses = useMemo(
    () => [...new Set(purchaseOrders.map((po) => po.status).filter(Boolean))].sort(),
    [purchaseOrders]
  );

  const filteredPurchaseOrders = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return purchaseOrders.filter((po) => {
      const statusMatch = status === "all" || po.status === status;
      const searchMatch = !needle || [
        po.po_id, po.po_number, po.supplier_name, po.product_name,
        po.sku, po.status, po.created_by, po.created_by_user_id,
      ].some((value) => String(value ?? "").toLowerCase().includes(needle));
      return statusMatch && searchMatch;
    });
  }, [purchaseOrders, search, status]);

  return (
    <>
      <div className="section-head">
        <div><h2>Purchase Orders</h2><p>Live records from WBO_PurchaseOrders.</p></div>
        <button className="btn-primary" type="button" onClick={() => openModal("addPurchaseOrder")}>+ New Purchase Order</button>
      </div>

      <div className="ops-panel user-filter-panel">
        <div className="user-search-wrap">
          <input className="user-search-input" type="search" value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search PO, supplier, product, creator..." aria-label="Search purchase orders" />
          {search && <button className="user-search-clear" type="button" onClick={() => setSearch("")}>Clear</button>}
        </div>
        <select value={status} onChange={(event) => setStatus(event.target.value)}>
          <option value="all">All Statuses</option>
          {statuses.map((poStatus) => <option key={poStatus} value={poStatus}>{poStatus}</option>)}
        </select>
      </div>

      <div className="ops-panel"><div className="table-wrap"><table className="ops-table">
        <thead><tr><th>PO ID</th><th>Supplier</th><th>Product</th><th>Quantity</th><th>Status</th><th>Created By</th><th>Created</th></tr></thead>
        <tbody>
          {filteredPurchaseOrders.length === 0
            ? <EmptyTable colSpan={7} text="No purchase orders match your filters." />
            : filteredPurchaseOrders.map((po, index) => <tr key={`${po.po_id}-${po.po_detail_id || index}`}>
                <td>#{po.po_id}</td><td>{po.supplier_name}</td><td>{po.product_name}</td><td>{number(po.quantity)}</td>
                <td><span className={`status-badge ${poStatusClass(po.status)}`}>{po.status}</span></td>
                <td>{po.created_by || `User #${po.created_by_user_id}`}</td><td>{formatDate(po.created_at)}</td>
              </tr>)}
        </tbody>
      </table></div></div>
    </>
  );
}

export default PurchaseOrders;