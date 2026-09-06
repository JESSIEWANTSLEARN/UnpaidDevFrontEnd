import React from "react";
import { number } from "../../../utils/super-admin/superAdminUtils.js";
import { EmptyTable } from "../common/AdminCommon.jsx";

function Suppliers({ data, openModal }) {
  const suppliers = data.suppliers || [];
  return (
    <>
      <div className="section-head"><div><h2>Suppliers</h2><p>Live supplier records and product counts.</p></div><button className="btn-primary" type="button" onClick={() => openModal("addSupplier")}>+ Add Supplier</button></div>
      <div className="ops-panel"><div className="table-wrap"><table className="ops-table">
        <thead><tr><th>Supplier</th><th>Contact</th><th>Email</th><th>Lead Time</th><th>Products</th></tr></thead>
        <tbody>{suppliers.length === 0 ? <EmptyTable colSpan={5} text="No suppliers found." /> : suppliers.map((supplier) => <tr key={supplier.supplier_id}>
          <td>{supplier.name}</td><td>{supplier.contact_number || "—"}</td><td>{supplier.email || "—"}</td><td>{number(supplier.lead_time_days)} day(s)</td><td>{number(supplier.product_count)}</td>
        </tr>)}</tbody>
      </table></div></div>
    </>
  );
}


export default Suppliers;
