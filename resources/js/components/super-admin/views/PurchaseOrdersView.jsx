import React from "react";
import { number, formatDate, poStatusClass } from "../../../utils/super-admin/superAdminUtils.js";
import { EmptyTable } from "../common/AdminCommon.jsx";

function PurchaseOrders({ data, openModal }) {
  const purchaseOrders = data.purchase_orders || [];
  return (
    <>
      <div className="section-head"><div><h2>Purchase Orders</h2><p>Live records from WBO_PurchaseOrders.</p></div><button className="btn-primary" type="button" onClick={() => openModal("addPurchaseOrder")}>+ New Purchase Order</button></div>
      <div className="ops-panel"><div className="table-wrap"><table className="ops-table">
        <thead><tr><th>PO ID</th><th>Supplier</th><th>Product</th><th>Quantity</th><th>Status</th><th>Created By</th><th>Created</th></tr></thead>
        <tbody>{purchaseOrders.length === 0 ? <EmptyTable colSpan={7} text="No purchase orders found." /> : purchaseOrders.map((po) => <tr key={po.po_id}>
          <td>#{po.po_id}</td><td>{po.supplier_name}</td><td>{po.product_name}</td><td>{number(po.quantity)}</td><td><span className={`status-badge ${poStatusClass(po.status)}`}>{po.status}</span></td><td>{po.created_by || `User #${po.created_by_user_id}`}</td><td>{formatDate(po.created_at)}</td>
        </tr>)}</tbody>
      </table></div></div>
    </>
  );
}


export default PurchaseOrders;
